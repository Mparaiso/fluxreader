/*jslint  eqeq:true,node:true,es5:true,white:true,plusplus:true,nomen:true,unparam:true,devel:true,regexp:true */
/*global angular*/
/*Copyright © 2014 mparaiso <mparaiso@online.fr>. All Rights Reserved.*/
/** some directives */
"use strict";
angular.module('ng')
.directive('media',function(){
    return {
        restrict:'E',
        scope:{
            src:"="
        },
        template:"<div ng-switch='getType(src)'>\
            <audio ng-switch-when='audio' src='{{mediaUrl(src)}}' controls ></audio>\
            <video ng-switch-when='video' src='{{mediaUrl(src)}}' controls ></video>\
            <img ng-switch-when='image' ng-src='{{mediaUrl(src)}}' alt='' />\
            <a ng-switch-default ng-href='{{mediaUrl(src)}}' target='_blank'>{{src}}</a>\
        </div>",
        controller:function($scope,$sce){
            $scope.mediaUrl=function(src){
                return $sce.trustAsResourceUrl(src);
            };
            $scope.getType=function(src){
                if (typeof src !=='string') {return;}
                var suffix = src.match(/\w+$/)[0];
                switch(suffix) {
                    case 'mp3':
                    case 'oga':
                    case 'wav':
                        return "audio";
                    case 'mpg':
                    case 'mpeg':
                    case 'mp4':
                    case 'webm':
                    case 'ogv':
                    case 'ogg':
                        return "video";
                    case 'webp':
                    case 'jpg':
                    case 'jpeg':
                    case 'gif':
                    case 'png':
                        return "image";
                    default:
                        return "";
                }
            };
        }
    };
})
.directive('thumbnail',function($timeout){
    /** wrap img tags into div.thumbnail tags and add target attribute to a tag */
    return {
        priority:1000,
        scope:{
            thumbnail:"="
        },
        link:function($scope,element,attributes){
            var $unwatch = $scope.$watch('thumbnail',function(newValue,oldValue){
                if(newValue && newValue!==oldValue){
                    $timeout(function(){
                        element.find('img').wrap('<div class="thumbnail">');
                        element.find('a').attr('target','_blank');
                        $unwatch();
                    });
                }
            });

        }
    };
});
