def now_time(offset = 8):
    from datetime import datetime, timezone, timedelta

    return datetime.now(tz = timezone(timedelta(hours = offset)))

def strftime(time):
    return time.strftime("%y%m%d%H%M%S")

def strptime(str, offset = 8):
    from datetime import datetime, timezone, timedelta

    time = datetime.strptime(str, "%y%m%d%H%M%S").replace(tzinfo = timezone(timedelta(hours = offset)))

    return time

def now_time_str():
    return strftime(now_time())
