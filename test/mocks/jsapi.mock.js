/** google jsapi mock **/

var googleMock = {
    load: function () {
    },
    feeds: {
        Feed: function () {
            this.load = function () {
            }
        }
    }
}