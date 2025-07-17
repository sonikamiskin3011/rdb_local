# Groups an order list of list by specified column count (check_num) - returns dict
def get_children_dict(array, check_num, num=0):
    # escape special characters
    if num == 0:
        proc_arr = []
        sub_arr = []

        for arr in array:
            for sub in arr:
                if isinstance(sub, str):
                    sub = sub.replace("&", "and").replace("'", "")
                sub_arr.append(sub)

            proc_arr.append(sub_arr)
            sub_arr = []

        array = proc_arr

    if num > check_num:
        return array

    res = {}
    first = array[0]
    children = []
    children.append(first[1:])
    check = str(first[0])
    for i in range(1, len(array)):
        if check != str(array[i][0]):
            res[check] = {}
            res[check]["children"] = get_children_dict(children, check_num, num + 1)
            children = []
            check = str(array[i][0])
        children.append(array[i][1:])

    res[check] = {}

    res[check]["children"] = get_children_dict(children, check_num, num + 1)
    return res
