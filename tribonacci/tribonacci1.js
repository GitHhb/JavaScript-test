var tribonacci = function (arr, n) {
    
    if (n === 0) return arr;
    
    // n > 0
    let sum = arr[arr.length-3] + arr[arr.length-2] + arr[arr.length-1];
    arr.push(sum);
    return tribonacci(arr, n-1);
}

var tribonacci2 = function (arr, n) {
    if (n === 0 ) return arr;

    // n > 0
    tribonacci2(arr, n-1);
    let sum = arr[arr.length-3] + arr[arr.length-2] + arr[arr.length-1];
    arr.push(sum);
    return arr;
}

console.log( tribonacci([1, 1, 1], 9) );
console.log( tribonacci2([1, 1, 1], 9) );