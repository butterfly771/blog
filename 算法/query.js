function parse(str) {
    const arr = str.split('&')
    return arr.reduce((obj, kv) => {
        const [key, value] = kv.split('=');
        if(!value) {
            return obj
        }
        deep_set(obj, key.split(/[\[\]]/g).filter(x=>x), value)
        return obj
    }, {})
}

function deep_set(o, path, value) {
    let i = 0
    for(; i < path.length - 1; i++) {
        if(o[path[i]] === undefined) {
            if(path[i+1].match(/^\d+$/)) {
                o[path[i]] = []
            }else {
                o[path[i]] = {}
            }
        }

        o = o[path[i]]
    }

    o[path[i]] = decodeURIComponent(value) 
}

console.log(parse('a[0]=yuei&a[1]=123&b=2'))
console.log(parse('a[0]=1&a[1]=2'))
console.log(parse('a&b&c'))
console.log(parse('color=Deep%20blue'))

// console.
// a&b&c
// a[name]=yueqi&a[age]=tecent&b=wht
// a[0]=1&a[1]=2
// color=Deep%20blue
// a=1&b=2