def now_time(offset = 8):
    from datetime import datetime, timezone, timedelta

    return datetime.now(tz = timezone(timedelta(hours = offset)))

def strftime(time):
    return time.strftime("%y%m%d%H%M%S")

def strptime(str):
    from datetime import datetime
    from pytz import timezone

    tz = timezone('Asia/Shanghai')
    time = tz.localize(datetime.strptime(str, "%y%m%d%H%M%S"))

    return time

def now_time_str():
    return strftime(now_time())
