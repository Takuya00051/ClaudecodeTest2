import math

def is_prime(n: int) -> bool:
    if n < 2:
        return False
    return all(n % i != 0 for i in range(2, int(math.sqrt(n)) + 1))

def primes_up_to(limit: int) -> list[int]:
    return [n for n in range(2, limit + 1) if is_prime(n)]

def gcd(a: int, b: int) -> int:
    while b:
        a, b = b, a % b
    return a
