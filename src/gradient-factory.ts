class GradientFactory {
    beginColor = {
        red: 0,
        green: 0,
        blue: 0,
    };
    endColor = {
        red: 255,
        green: 255,
        blue: 255,
    }
    colorStops: number;
    colors: string[];
    colorKeys: string[];
    constructor() {
        this.colorStops = 24;
        this.colors = [];
        this.colorKeys = ['red', 'green', 'blue'];
    }
    private byte_to_hex(n) {
        var hexVals = "0123456789ABCDEF";
		return String(hexVals.substr((n >> 4) & 0x0F, 1)) + hexVals.substr(n & 0x0F, 1);
    }
    private rgb_to_hex(r, g, b) {
        return '#' + this.byte_to_hex(r) + this.byte_to_hex(g) + this.byte_to_hex(b);
    }
    private parse_color(color) {
        if ((color).toString() === "[object Object]") {
            return color;
        } else {
            color = (color.charAt(0) == "#") ? color.substring(1, 7) : color;
            return {
                red: parseInt((color).substring(0, 2), 16),
                green: parseInt((color).substring(2, 4), 16),
                blue: parseInt((color).substring(4, 6), 16)
            };
        }
    }
    public generate(opts) {
        var colors = [];
        this.colors = [];
        var options = opts || {};
        var diff = {
            red: 0,
            green: 0,
            blue: 0
        };
        var len = this.colorKeys.length;
        var pOffset = 0;
        if (typeof(options.from) !== 'undefined') {
            this.beginColor = this.parse_color(options.from);
        }
        if (typeof(options.to) !== 'undefined') {
            this.endColor = this.parse_color(options.to);
        }
        if (typeof(options.stops) !== 'undefined') {
            this.colorStops = options.stops;
        }
        this.colorStops = Math.max(1, this.colorStops - 1);
        for (var x = 0; x < this.colorStops; x++) {
            // TODO: fix this
            pOffset = parseFloat(x, 10) / this.colorStops;
            for (var y = 0; y < len; y++) {
                diff[this.colorKeys[y]] = this.endColor[this.colorKeys[y]] - this.beginColor[this.colorKeys[y]];
                diff[this.colorKeys[y]] = (diff[this.colorKeys[y]] * pOffset) + this.beginColor[this.colorKeys[y]];
            }
            this.colors.push(this.rgb_to_hex(diff.red, diff.green, diff.blue));
        }
        this.colors.push(this.rgb_to_hex(this.endColor.red, this.endColor.green, this.endColor.blue));
        return this.colors;
    }

}