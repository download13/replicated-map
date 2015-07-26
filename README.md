# replicated-map


The path of transmission must carry the messages IN ORDER. If the messages are out of order the accuracy of the replication cannot be guaranteed. Imagine doing `set key 3` and `set key 7`. If they are out of the order the older command may overwrite the newer one.
