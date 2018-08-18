import hashlib
import binascii
import timeit

password = b'this is a password'
salt = b'this is a salt'

def test_time():
    dk = hashlib.pbkdf2_hmac('sha256',password,salt,100000)
    dk_h = binascii.hexlify(dk)

time = timeit.timeit(stmt=test_time,number=50,globals=globals())

print(time)

#time = 6.83s / 50
