class Node:
    def __init__(self, val):
        self.val = val
        self.next = None

class LinkedList:
    def __init__(self):
        self.head = None

    def append(self, val):
        node = Node(val)
        if not self.head:
            self.head = node
            return
        cur = self.head
        while cur.next:
            cur = cur.next
        cur.next = node

    def to_list(self):
        result, cur = [], self.head
        while cur:
            result.append(cur.val)
            cur = cur.next
        return result

    def __repr__(self):
        return " -> ".join(map(str, self.to_list()))
