def mat_mul(A, B):
    rows_A, cols_A = len(A), len(A[0])
    cols_B = len(B[0])
    C = [[0] * cols_B for _ in range(rows_A)]
    for i in range(rows_A):
        for j in range(cols_B):
            for k in range(cols_A):
                C[i][j] += A[i][k] * B[k][j]
    return C

def transpose(M):
    return [[M[r][c] for r in range(len(M))] for c in range(len(M[0]))]
