angular.module('lZcompressor',[])
.service("compressor",function(){
    this.compress=function(string){
        return LZString.compressToBase64(string);
    };
    this.decompress=function(string){
        return  LZString.decompressFromBase64(string);
    }
});
