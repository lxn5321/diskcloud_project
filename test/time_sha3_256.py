import hashlib
import timeit

password = b'this is a password'

def test_time():
    dk_h = hashlib.sha3_256(password).hexdigest()

time = timeit.timeit(stmt=test_time,number=100000,globals=globals())

print(time)

#time = 0.09s / 100000
