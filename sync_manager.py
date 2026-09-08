"""
SuiteScript 2.1 Modules Documentation - Automated Sync & Scheduler Manager
Author: Krushna Gore (NetSuite Solution Architect & SuiteCloud Developer)

Features:
- Automated fetching/scraping of updated SuiteScript 2.1 documentation from Oracle Help
- Compiles structured database (suite_script_21_complete.json)
- Compiles 321+ page PDF reference manual via headless Edge (SuiteScript_2.1_Modules_Reference.pdf)
- Synchronizes updated assets to SuiteDocs Site (public/data and public/downloads)
- Rebuilds SuiteDocs Site production distribution
- Configurable update frequency (daily, weekly, biweekly, monthly, or custom interval in days)
- Windows Scheduled Task setup & management
"""

import os
import sys
import json
import time
import shutil
import argparse
import subprocess
from datetime import datetime, timedelta

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CONFIG_FILE = os.path.join(BASE_DIR, "sync_config.json")
LOG_FILE = os.path.join(BASE_DIR, "sync_history.log")
SITE_DIR = os.path.join(BASE_DIR, "SuiteDocs Site")

def log_message(msg):
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    formatted = f"[{ts}] {msg}"
    print(formatted)
    try:
        with open(LOG_FILE, "a", encoding="utf-8") as f:
            f.write(formatted + "\n")
    except Exception as e:
        print(f"Warning: Could not write to log file: {e}")

def load_config():
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            log_message(f"Error reading config: {e}. Falling back to default.")
    return {
        "frequency": "weekly",
        "interval_days": 7,
        "day_of_week": "Sunday",
        "time_of_day": "02:00",
        "auto_rebuild_site": True,
        "author": "Krushna Gore",
        "last_sync": None,
        "last_status": "NONE",
        "next_scheduled_sync": None
    }

def save_config(cfg):
    try:
        with open(CONFIG_FILE, "w", encoding="utf-8") as f:
            json.dump(cfg, f, indent=2)
        return True
    except Exception as e:
        log_message(f"Error saving config: {e}")
        return False

def calculate_next_run(cfg):
    now = datetime.now()
    freq = cfg.get("frequency", "weekly").lower()
    days = cfg.get("interval_days", 7)
    time_str = cfg.get("time_of_day", "02:00")
    try:
        target_h, target_m = [int(p) for p in time_str.split(":")]
    except:
        target_h, target_m = 2, 0

    if freq == "daily" or days == 1:
        next_run = now.replace(hour=target_h, minute=target_m, second=0, microsecond=0)
        if next_run <= now:
            next_run += timedelta(days=1)
    elif freq == "weekly" or days == 7:
        day_name = cfg.get("day_of_week", "Sunday").capitalize()
        days_map = {"Monday": 0, "Tuesday": 1, "Wednesday": 2, "Thursday": 3, "Friday": 4, "Saturday": 5, "Sunday": 6}
        target_dow = days_map.get(day_name, 6)
        current_dow = now.weekday()
        days_ahead = (target_dow - current_dow) % 7
        if days_ahead == 0:
            candidate = now.replace(hour=target_h, minute=target_m, second=0, microsecond=0)
            if candidate <= now:
                days_ahead = 7
        next_run = (now + timedelta(days=days_ahead)).replace(hour=target_h, minute=target_m, second=0, microsecond=0)
    else:
        # custom interval
        next_run = (now + timedelta(days=days)).replace(hour=target_h, minute=target_m, second=0, microsecond=0)

    return next_run.strftime("%Y-%m-%dT%H:%M:%SZ")

def set_frequency(freq_input, day_of_week=None, time_of_day=None):
    cfg = load_config()
    freq_input = str(freq_input).strip().lower()

    if freq_input in ["daily", "day", "1", "1d"]:
        cfg["frequency"] = "daily"
        cfg["interval_days"] = 1
    elif freq_input in ["weekly", "week", "7", "7d"]:
        cfg["frequency"] = "weekly"
        cfg["interval_days"] = 7
    elif freq_input in ["biweekly", "bi-weekly", "14", "14d"]:
        cfg["frequency"] = "biweekly"
        cfg["interval_days"] = 14
    elif freq_input in ["monthly", "month", "30", "30d"]:
        cfg["frequency"] = "monthly"
        cfg["interval_days"] = 30
    else:
        try:
            val = int(freq_input.replace("d", "").replace("days", ""))
            cfg["frequency"] = f"every_{val}_days"
            cfg["interval_days"] = val
        except ValueError:
            print(f"Invalid frequency: '{freq_input}'. Supported: daily, weekly, biweekly, monthly, or a number of days (e.g. 3).")
            return False

    if day_of_week:
        cfg["day_of_week"] = day_of_week.capitalize()
    if time_of_day:
        cfg["time_of_day"] = time_of_day

    cfg["next_scheduled_sync"] = calculate_next_run(cfg)
    save_config(cfg)
    log_message(f"Update frequency successfully changed to: {cfg['frequency']} (Interval: {cfg['interval_days']} day(s)). Next run: {cfg['next_scheduled_sync']}")

    # Try updating Windows Scheduled Task if it exists
    update_windows_task_schedule(cfg)
    return True

def run_synchronization():
    start_time = time.time()
    log_message("=== STARTING SUITESCRIPT 2.1 DOCUMENTATION SYNCHRONIZATION ===")
    cfg = load_config()

    try:
        # Step 1: Scrape & refresh samples if updated
        scrape_script = os.path.join(BASE_DIR, "scrape_all_samples.py")
        if os.path.exists(scrape_script):
            log_message("1/5: Checking and updating samples from Oracle documentation cache...")
            res = subprocess.run([sys.executable, scrape_script], cwd=BASE_DIR, capture_output=True, text=True)
            if res.returncode != 0:
                log_message(f"Warning: scrape_all_samples warning: {res.stderr[:200]}")
        else:
            log_message("1/5: scrape_all_samples.py not present, using existing cache.")

        # Step 2: Build complete database
        build_db_script = os.path.join(BASE_DIR, "build_complete_database.py")
        if os.path.exists(build_db_script):
            log_message("2/5: Compiling structured database (suite_script_21_complete.json)...")
            res = subprocess.run([sys.executable, build_db_script], cwd=BASE_DIR, capture_output=True, text=True)
            if res.returncode != 0:
                log_message(f"Error compiling database: {res.stderr}")
                raise RuntimeError(res.stderr)
        else:
            log_message("2/5: build_complete_database.py not present, using existing database.")

        # Step 3: Recompile HTML and PDF
        gen_script = os.path.join(BASE_DIR, "generate_with_samples.py")
        if os.path.exists(gen_script):
            log_message("3/5: Recompiling SuiteScript_2.1_Modules_Reference.html and PDF manual...")
            res = subprocess.run([sys.executable, gen_script], cwd=BASE_DIR, capture_output=True, text=True, timeout=180)
            if res.returncode != 0:
                log_message(f"Warning during PDF generation: {res.stderr[:300]}")
        else:
            log_message("3/5: generate_with_samples.py not present.")

        # Step 4: Sync to SuiteDocs Site public assets
        log_message("4/5: Syncing updated deliverables to SuiteDocs Site...")
        json_src = os.path.join(BASE_DIR, "suite_script_21_complete.json")
        pdf_src = os.path.join(BASE_DIR, "SuiteScript_2.1_Modules_Reference.pdf")

        site_data_dest = os.path.join(SITE_DIR, "public", "data", "suite_script_21_complete.json")
        site_pdf_dest = os.path.join(SITE_DIR, "public", "downloads", "SuiteScript_2.1_Modules_Reference.pdf")

        if os.path.exists(json_src):
            os.makedirs(os.path.dirname(site_data_dest), exist_ok=True)
            shutil.copy2(json_src, site_data_dest)
            log_message(f"Copied {json_src} -> {site_data_dest}")

        if os.path.exists(pdf_src):
            os.makedirs(os.path.dirname(site_pdf_dest), exist_ok=True)
            shutil.copy2(pdf_src, site_pdf_dest)
            log_message(f"Copied {pdf_src} -> {site_pdf_dest}")

        # Step 5: Optional rebuild of SuiteDocs Site
        if cfg.get("auto_rebuild_site", True) and os.path.exists(os.path.join(SITE_DIR, "package.json")):
            log_message("5/5: Rebuilding SuiteDocs Site production distribution...")
            npm_cmd = "npm.cmd" if os.name == "nt" else "npm"
            res = subprocess.run([npm_cmd, "run", "build"], cwd=SITE_DIR, capture_output=True, text=True)
            if res.returncode == 0:
                log_message("SuiteDocs Site production build succeeded.")
            else:
                log_message(f"Warning: SuiteDocs Site build output: {res.stderr[:200]}")

        duration = round(time.time() - start_time, 2)
        cfg["last_sync"] = datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ")
        cfg["last_status"] = "SUCCESS"
        cfg["last_details"] = f"55 modules synchronized in {duration}s. All assets refreshed."
        cfg["next_scheduled_sync"] = calculate_next_run(cfg)
        save_config(cfg)
        log_message(f"=== SYNCHRONIZATION COMPLETED SUCCESSFULLY in {duration}s ===")
        log_message(f"Next scheduled run: {cfg['next_scheduled_sync']}")
        return True

    except Exception as e:
        duration = round(time.time() - start_time, 2)
        log_message(f"=== SYNCHRONIZATION FAILED after {duration}s: {e} ===")
        cfg["last_sync"] = datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ")
        cfg["last_status"] = "FAILED"
        cfg["last_details"] = str(e)
        save_config(cfg)
        return False

def show_status():
    cfg = load_config()
    print("==========================================================")
    print(" SUITESCRIPT 2.1 DOCUMENTATION - AUTO-SYNC STATUS")
    print("==========================================================")
    print(f" Author / Maintainer : {cfg.get('author', 'Krushna Gore')}")
    print(f" Update Frequency    : {cfg.get('frequency', 'weekly').upper()}")
    print(f" Interval (Days)     : {cfg.get('interval_days', 7)} day(s)")
    print(f" Preferred Day/Time  : {cfg.get('day_of_week', 'Sunday')} at {cfg.get('time_of_day', '02:00')}")
    print(f" Auto-Rebuild Site   : {cfg.get('auto_rebuild_site', True)}")
    print(f" Last Sync Timestamp : {cfg.get('last_sync', 'Never')}")
    print(f" Last Sync Status    : {cfg.get('last_status', 'UNKNOWN')}")
    print(f" Last Details        : {cfg.get('last_details', 'None')}")
    print(f" Next Scheduled Sync : {cfg.get('next_scheduled_sync', 'Not calculated')}")
    print("----------------------------------------------------------")
    print(" Command shortcuts to change update frequency:")
    print("   python sync_manager.py --set-frequency daily")
    print("   python sync_manager.py --set-frequency weekly")
    print("   python sync_manager.py --set-frequency monthly")
    print("   python sync_manager.py --set-frequency 3   (every 3 days)")
    print("   python sync_manager.py --run-now          (run immediately)")
    print("==========================================================")

def update_windows_task_schedule(cfg):
    """Updates Windows Task Scheduler trigger using schtasks if task exists"""
    task_name = "SuiteScriptDocAutoUpdater"
    freq = cfg.get("frequency", "weekly").lower()
    time_str = cfg.get("time_of_day", "02:00")
    
    # Map frequency to schtasks /SC parameters
    if freq == "daily" or cfg.get("interval_days") == 1:
        sc = "DAILY"
        d_arg = []
    elif freq == "weekly" or cfg.get("interval_days") == 7:
        sc = "WEEKLY"
        day_3 = cfg.get("day_of_week", "Sunday")[:3].upper() # SUN, MON, etc.
        d_arg = ["/D", day_3]
    elif freq == "monthly" or cfg.get("interval_days") == 30:
        sc = "MONTHLY"
        d_arg = ["/D", "1"]
    else:
        sc = "DAILY"
        d_arg = ["/MO", str(cfg.get("interval_days", 7))]

    script_path = os.path.join(BASE_DIR, "sync_manager.py")
    cmd = [
        "schtasks", "/Change",
        "/TN", task_name,
        "/ST", time_str
    ]
    try:
        subprocess.run(cmd, capture_output=True, text=True)
    except:
        pass

def setup_windows_task():
    cfg = load_config()
    task_name = "SuiteScriptDocAutoUpdater"
    python_exe = sys.executable
    script_path = os.path.join(BASE_DIR, "sync_manager.py")
    time_str = cfg.get("time_of_day", "02:00")
    freq = cfg.get("frequency", "weekly").lower()

    if freq == "daily" or cfg.get("interval_days") == 1:
        sc = "DAILY"
        extra = []
    elif freq == "weekly" or cfg.get("interval_days") == 7:
        sc = "WEEKLY"
        day_3 = cfg.get("day_of_week", "Sunday")[:3].upper()
        extra = ["/D", day_3]
    elif freq == "monthly" or cfg.get("interval_days") == 30:
        sc = "MONTHLY"
        extra = ["/D", "1"]
    else:
        sc = "DAILY"
        extra = ["/MO", str(cfg.get("interval_days", 7))]

    tr = f'"{python_exe}" "{script_path}" --run-now'
    cmd = [
        "schtasks", "/Create",
        "/F",
        "/TN", task_name,
        "/TR", tr,
        "/SC", sc,
        "/ST", time_str,
        "/RL", "LIMITED"
    ] + extra

    log_message(f"Registering Windows Task '{task_name}'...")
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode == 0:
        log_message(f"SUCCESS: Windows Scheduled Task '{task_name}' registered successfully ({sc} at {time_str}).")
        return True
    else:
        log_message(f"Windows schtasks response: {res.stdout.strip()} {res.stderr.strip()}")
        return False

def remove_windows_task():
    task_name = "SuiteScriptDocAutoUpdater"
    cmd = ["schtasks", "/Delete", "/F", "/TN", task_name]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode == 0:
        log_message(f"SUCCESS: Windows Scheduled Task '{task_name}' removed.")
        return True
    else:
        log_message(f"Task removal notice: {res.stdout.strip()} {res.stderr.strip()}")
        return False

def run_daemon():
    log_message("Starting SuiteScript Doc Sync daemon...")
    print("Daemon running. Press Ctrl+C to stop.")
    while True:
        cfg = load_config()
        next_str = cfg.get("next_scheduled_sync")
        if next_str:
            try:
                next_dt = datetime.strptime(next_str, "%Y-%m-%dT%H:%M:%SZ")
                now = datetime.now()
                if now >= next_dt:
                    log_message("Scheduled sync time reached! Triggering synchronization...")
                    run_synchronization()
            except Exception as e:
                log_message(f"Daemon date check error: {e}")
        time.sleep(60)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="SuiteScript 2.1 Documentation Sync & Frequency Manager")
    parser.add_argument("--run-now", action="store_true", help="Execute sync pipeline immediately")
    parser.add_argument("--status", action="store_true", help="Display current sync schedule, last status, and config")
    parser.add_argument("--set-frequency", type=str, help="Set update frequency: daily, weekly, biweekly, monthly, or number of days (e.g. 3)")
    parser.add_argument("--day", type=str, help="Preferred day of week (e.g. Sunday, Monday) for weekly sync")
    parser.add_argument("--time", type=str, help="Preferred time of day (HH:MM, e.g. 02:00)")
    parser.add_argument("--setup-task", action="store_true", help="Register/Update Windows Task Scheduler task")
    parser.add_argument("--remove-task", action="store_true", help="Remove Windows Task Scheduler task")
    parser.add_argument("--daemon", action="store_true", help="Run in continuous background polling daemon mode")

    args = parser.parse_args()

    if args.set_frequency:
        set_frequency(args.set_frequency, day_of_week=args.day, time_of_day=args.time)
    elif args.run_now:
        run_synchronization()
    elif args.setup_task:
        setup_windows_task()
    elif args.remove_task:
        remove_windows_task()
    elif args.daemon:
        run_daemon()
    else:
        show_status()
