import hashlib
import timeit

password = b'this is a password'
salt = b'a salt'

def test_time():
    dk_h = hashlib.blake2s(password,salt=salt).hexdigest()

time = timeit.timeit(stmt=test_time,number=100000,globals=globals())
print(time)

#time = 0.83s / 100000
