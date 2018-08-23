def generate_random_str(randomlength=16):
    import random
    import string
    """
    string.digits=0123456789
    string.ascii_letters=abcdefghigklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ
    """
    sequence = string.digits + string.ascii_letters + string.digits
    str_list = random.choices(sequence,k=8)
    random_str = ''.join(str_list)
    return random_str

# return a 64bit Hexadecimal as pw_hashed
def hash_sha3(password):
    import hashlib

    pw_hashed = hashlib.sha3_256(password.encode('utf-8')).hexdigest()
    return pw_hashed
