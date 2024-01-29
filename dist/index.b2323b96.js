(()=>{
    function e(e, t, n, r) {
        Object.defineProperty(e, t, {
            get: n,
            set: r,
            enumerable: !0,
            configurable: !0
        });
    }
    function t(e) {
        return e && e.__esModule ? e.default : e;
    }
    class n {
        constructor(){
            this.chunkedMTU = 16300, this._dataCount = 1, this.chunk = (e)=>{
                let t = [], n = e.byteLength, r = Math.ceil(n / this.chunkedMTU), i = 0, o = 0;
                for(; o < n;){
                    let s = Math.min(n, o + this.chunkedMTU), a = e.slice(o, s), c = {
                        __peerData: this._dataCount,
                        n: i,
                        data: a,
                        total: r
                    };
                    t.push(c), o = s, i++;
                }
                return this._dataCount++, t;
            };
        }
    }
    class r {
        append_buffer(e) {
            this.flush(), this._parts.push(e);
        }
        append(e) {
            this._pieces.push(e);
        }
        flush() {
            if (this._pieces.length > 0) {
                let e = new Uint8Array(this._pieces);
                this._parts.push(e), this._pieces = [];
            }
        }
        toArrayBuffer() {
            let e = [];
            for (let t of this._parts)e.push(t);
            return function(e) {
                let t = 0;
                for (let n of e)t += n.byteLength;
                let n = new Uint8Array(t), r = 0;
                for (let t of e){
                    let e = new Uint8Array(t.buffer, t.byteOffset, t.byteLength);
                    n.set(e, r), r += t.byteLength;
                }
                return n;
            }(e).buffer;
        }
        constructor(){
            this.encoder = new TextEncoder, this._pieces = [], this._parts = [];
        }
    }
    function i(e) {
        return new s(e).unpack();
    }
    function o(e) {
        let t = new a, n = t.pack(e);
        return n instanceof Promise ? n.then(()=>t.getBuffer()) : t.getBuffer();
    }
    class s {
        unpack() {
            let e;
            let t = this.unpack_uint8();
            if (t < 128) return t;
            if ((224 ^ t) < 32) return (224 ^ t) - 32;
            if ((e = 160 ^ t) <= 15) return this.unpack_raw(e);
            if ((e = 176 ^ t) <= 15) return this.unpack_string(e);
            if ((e = 144 ^ t) <= 15) return this.unpack_array(e);
            if ((e = 128 ^ t) <= 15) return this.unpack_map(e);
            switch(t){
                case 192:
                    return null;
                case 193:
                case 212:
                case 213:
                case 214:
                case 215:
                    return;
                case 194:
                    return !1;
                case 195:
                    return !0;
                case 202:
                    return this.unpack_float();
                case 203:
                    return this.unpack_double();
                case 204:
                    return this.unpack_uint8();
                case 205:
                    return this.unpack_uint16();
                case 206:
                    return this.unpack_uint32();
                case 207:
                    return this.unpack_uint64();
                case 208:
                    return this.unpack_int8();
                case 209:
                    return this.unpack_int16();
                case 210:
                    return this.unpack_int32();
                case 211:
                    return this.unpack_int64();
                case 216:
                    return e = this.unpack_uint16(), this.unpack_string(e);
                case 217:
                    return e = this.unpack_uint32(), this.unpack_string(e);
                case 218:
                    return e = this.unpack_uint16(), this.unpack_raw(e);
                case 219:
                    return e = this.unpack_uint32(), this.unpack_raw(e);
                case 220:
                    return e = this.unpack_uint16(), this.unpack_array(e);
                case 221:
                    return e = this.unpack_uint32(), this.unpack_array(e);
                case 222:
                    return e = this.unpack_uint16(), this.unpack_map(e);
                case 223:
                    return e = this.unpack_uint32(), this.unpack_map(e);
            }
        }
        unpack_uint8() {
            let e = 255 & this.dataView[this.index];
            return this.index++, e;
        }
        unpack_uint16() {
            let e = this.read(2), t = (255 & e[0]) * 256 + (255 & e[1]);
            return this.index += 2, t;
        }
        unpack_uint32() {
            let e = this.read(4), t = ((256 * e[0] + e[1]) * 256 + e[2]) * 256 + e[3];
            return this.index += 4, t;
        }
        unpack_uint64() {
            let e = this.read(8), t = ((((((256 * e[0] + e[1]) * 256 + e[2]) * 256 + e[3]) * 256 + e[4]) * 256 + e[5]) * 256 + e[6]) * 256 + e[7];
            return this.index += 8, t;
        }
        unpack_int8() {
            let e = this.unpack_uint8();
            return e < 128 ? e : e - 256;
        }
        unpack_int16() {
            let e = this.unpack_uint16();
            return e < 32768 ? e : e - 65536;
        }
        unpack_int32() {
            let e = this.unpack_uint32();
            return e < 2147483648 ? e : e - 4294967296;
        }
        unpack_int64() {
            let e = this.unpack_uint64();
            return e < 0x7fffffffffffffff ? e : e - 18446744073709552e3;
        }
        unpack_raw(e) {
            if (this.length < this.index + e) throw Error(`BinaryPackFailure: index is out of range ${this.index} ${e} ${this.length}`);
            let t = this.dataBuffer.slice(this.index, this.index + e);
            return this.index += e, t;
        }
        unpack_string(e) {
            let t, n;
            let r = this.read(e), i = 0, o = "";
            for(; i < e;)(t = r[i]) < 160 ? (n = t, i++) : (192 ^ t) < 32 ? (n = (31 & t) << 6 | 63 & r[i + 1], i += 2) : (224 ^ t) < 16 ? (n = (15 & t) << 12 | (63 & r[i + 1]) << 6 | 63 & r[i + 2], i += 3) : (n = (7 & t) << 18 | (63 & r[i + 1]) << 12 | (63 & r[i + 2]) << 6 | 63 & r[i + 3], i += 4), o += String.fromCodePoint(n);
            return this.index += e, o;
        }
        unpack_array(e) {
            let t = Array(e);
            for(let n = 0; n < e; n++)t[n] = this.unpack();
            return t;
        }
        unpack_map(e) {
            let t = {};
            for(let n = 0; n < e; n++)t[this.unpack()] = this.unpack();
            return t;
        }
        unpack_float() {
            let e = this.unpack_uint32();
            return (0 == e >> 31 ? 1 : -1) * (8388607 & e | 8388608) * 2 ** ((e >> 23 & 255) - 127 - 23);
        }
        unpack_double() {
            let e = this.unpack_uint32(), t = this.unpack_uint32(), n = (e >> 20 & 2047) - 1023;
            return (0 == e >> 31 ? 1 : -1) * ((1048575 & e | 1048576) * 2 ** (n - 20) + t * 2 ** (n - 52));
        }
        read(e) {
            let t = this.index;
            if (t + e <= this.length) return this.dataView.subarray(t, t + e);
            throw Error("BinaryPackFailure: read index out of range");
        }
        constructor(e){
            this.index = 0, this.dataBuffer = e, this.dataView = new Uint8Array(this.dataBuffer), this.length = this.dataBuffer.byteLength;
        }
    }
    class a {
        getBuffer() {
            return this._bufferBuilder.toArrayBuffer();
        }
        pack(e) {
            if ("string" == typeof e) this.pack_string(e);
            else if ("number" == typeof e) Math.floor(e) === e ? this.pack_integer(e) : this.pack_double(e);
            else if ("boolean" == typeof e) !0 === e ? this._bufferBuilder.append(195) : !1 === e && this._bufferBuilder.append(194);
            else if (void 0 === e) this._bufferBuilder.append(192);
            else if ("object" == typeof e) {
                if (null === e) this._bufferBuilder.append(192);
                else {
                    let t = e.constructor;
                    if (e instanceof Array) {
                        let t = this.pack_array(e);
                        if (t instanceof Promise) return t.then(()=>this._bufferBuilder.flush());
                    } else if (e instanceof ArrayBuffer) this.pack_bin(new Uint8Array(e));
                    else if ("BYTES_PER_ELEMENT" in e) this.pack_bin(new Uint8Array(e.buffer, e.byteOffset, e.byteLength));
                    else if (e instanceof Date) this.pack_string(e.toString());
                    else if (e instanceof Blob) return e.arrayBuffer().then((e)=>{
                        this.pack_bin(new Uint8Array(e)), this._bufferBuilder.flush();
                    });
                    else if (t == Object || t.toString().startsWith("class")) {
                        let t = this.pack_object(e);
                        if (t instanceof Promise) return t.then(()=>this._bufferBuilder.flush());
                    } else throw Error(`Type "${t.toString()}" not yet supported`);
                }
            } else throw Error(`Type "${typeof e}" not yet supported`);
            this._bufferBuilder.flush();
        }
        pack_bin(e) {
            let t = e.length;
            if (t <= 15) this.pack_uint8(160 + t);
            else if (t <= 65535) this._bufferBuilder.append(218), this.pack_uint16(t);
            else if (t <= 4294967295) this._bufferBuilder.append(219), this.pack_uint32(t);
            else throw Error("Invalid length");
            this._bufferBuilder.append_buffer(e);
        }
        pack_string(e) {
            let t = this._textEncoder.encode(e), n = t.length;
            if (n <= 15) this.pack_uint8(176 + n);
            else if (n <= 65535) this._bufferBuilder.append(216), this.pack_uint16(n);
            else if (n <= 4294967295) this._bufferBuilder.append(217), this.pack_uint32(n);
            else throw Error("Invalid length");
            this._bufferBuilder.append_buffer(t);
        }
        pack_array(e) {
            let t = e.length;
            if (t <= 15) this.pack_uint8(144 + t);
            else if (t <= 65535) this._bufferBuilder.append(220), this.pack_uint16(t);
            else if (t <= 4294967295) this._bufferBuilder.append(221), this.pack_uint32(t);
            else throw Error("Invalid length");
            let n = (r)=>{
                if (r < t) {
                    let t = this.pack(e[r]);
                    return t instanceof Promise ? t.then(()=>n(r + 1)) : n(r + 1);
                }
            };
            return n(0);
        }
        pack_integer(e) {
            if (e >= -32 && e <= 127) this._bufferBuilder.append(255 & e);
            else if (e >= 0 && e <= 255) this._bufferBuilder.append(204), this.pack_uint8(e);
            else if (e >= -128 && e <= 127) this._bufferBuilder.append(208), this.pack_int8(e);
            else if (e >= 0 && e <= 65535) this._bufferBuilder.append(205), this.pack_uint16(e);
            else if (e >= -32768 && e <= 32767) this._bufferBuilder.append(209), this.pack_int16(e);
            else if (e >= 0 && e <= 4294967295) this._bufferBuilder.append(206), this.pack_uint32(e);
            else if (e >= -2147483648 && e <= 2147483647) this._bufferBuilder.append(210), this.pack_int32(e);
            else if (e >= -9223372036854776000 && e <= 0x7fffffffffffffff) this._bufferBuilder.append(211), this.pack_int64(e);
            else if (e >= 0 && e <= 18446744073709552e3) this._bufferBuilder.append(207), this.pack_uint64(e);
            else throw Error("Invalid integer");
        }
        pack_double(e) {
            let t = 0;
            e < 0 && (t = 1, e = -e);
            let n = Math.floor(Math.log(e) / Math.LN2), r = Math.floor((e / 2 ** n - 1) * 4503599627370496), i = t << 31 | n + 1023 << 20 | r / 4294967296 & 1048575;
            this._bufferBuilder.append(203), this.pack_int32(i), this.pack_int32(r % 4294967296);
        }
        pack_object(e) {
            let t = Object.keys(e), n = t.length;
            if (n <= 15) this.pack_uint8(128 + n);
            else if (n <= 65535) this._bufferBuilder.append(222), this.pack_uint16(n);
            else if (n <= 4294967295) this._bufferBuilder.append(223), this.pack_uint32(n);
            else throw Error("Invalid length");
            let r = (n)=>{
                if (n < t.length) {
                    let i = t[n];
                    if (e.hasOwnProperty(i)) {
                        this.pack(i);
                        let t = this.pack(e[i]);
                        if (t instanceof Promise) return t.then(()=>r(n + 1));
                    }
                    return r(n + 1);
                }
            };
            return r(0);
        }
        pack_uint8(e) {
            this._bufferBuilder.append(e);
        }
        pack_uint16(e) {
            this._bufferBuilder.append(e >> 8), this._bufferBuilder.append(255 & e);
        }
        pack_uint32(e) {
            let t = 4294967295 & e;
            this._bufferBuilder.append((4278190080 & t) >>> 24), this._bufferBuilder.append((16711680 & t) >>> 16), this._bufferBuilder.append((65280 & t) >>> 8), this._bufferBuilder.append(255 & t);
        }
        pack_uint64(e) {
            let t = e / 4294967296, n = e % 4294967296;
            this._bufferBuilder.append((4278190080 & t) >>> 24), this._bufferBuilder.append((16711680 & t) >>> 16), this._bufferBuilder.append((65280 & t) >>> 8), this._bufferBuilder.append(255 & t), this._bufferBuilder.append((4278190080 & n) >>> 24), this._bufferBuilder.append((16711680 & n) >>> 16), this._bufferBuilder.append((65280 & n) >>> 8), this._bufferBuilder.append(255 & n);
        }
        pack_int8(e) {
            this._bufferBuilder.append(255 & e);
        }
        pack_int16(e) {
            this._bufferBuilder.append((65280 & e) >> 8), this._bufferBuilder.append(255 & e);
        }
        pack_int32(e) {
            this._bufferBuilder.append(e >>> 24 & 255), this._bufferBuilder.append((16711680 & e) >>> 16), this._bufferBuilder.append((65280 & e) >>> 8), this._bufferBuilder.append(255 & e);
        }
        pack_int64(e) {
            let t = Math.floor(e / 4294967296), n = e % 4294967296;
            this._bufferBuilder.append((4278190080 & t) >>> 24), this._bufferBuilder.append((16711680 & t) >>> 16), this._bufferBuilder.append((65280 & t) >>> 8), this._bufferBuilder.append(255 & t), this._bufferBuilder.append((4278190080 & n) >>> 24), this._bufferBuilder.append((16711680 & n) >>> 16), this._bufferBuilder.append((65280 & n) >>> 8), this._bufferBuilder.append(255 & n);
        }
        constructor(){
            this._bufferBuilder = new r, this._textEncoder = new TextEncoder;
        }
    }
    let c = !0, l = !0;
    function p(e, t, n) {
        let r = e.match(t);
        return r && r.length >= n && parseInt(r[n], 10);
    }
    function d(e, t, n) {
        if (!e.RTCPeerConnection) return;
        let r = e.RTCPeerConnection.prototype, i = r.addEventListener;
        r.addEventListener = function(e, r) {
            if (e !== t) return i.apply(this, arguments);
            let o = (e)=>{
                let t = n(e);
                t && (r.handleEvent ? r.handleEvent(t) : r(t));
            };
            return this._eventMap = this._eventMap || {}, this._eventMap[t] || (this._eventMap[t] = new Map), this._eventMap[t].set(r, o), i.apply(this, [
                e,
                o
            ]);
        };
        let o = r.removeEventListener;
        r.removeEventListener = function(e, n) {
            if (e !== t || !this._eventMap || !this._eventMap[t] || !this._eventMap[t].has(n)) return o.apply(this, arguments);
            let r = this._eventMap[t].get(n);
            return this._eventMap[t].delete(n), 0 === this._eventMap[t].size && delete this._eventMap[t], 0 === Object.keys(this._eventMap).length && delete this._eventMap, o.apply(this, [
                e,
                r
            ]);
        }, Object.defineProperty(r, "on" + t, {
            get () {
                return this["_on" + t];
            },
            set (e) {
                this["_on" + t] && (this.removeEventListener(t, this["_on" + t]), delete this["_on" + t]), e && this.addEventListener(t, this["_on" + t] = e);
            },
            enumerable: !0,
            configurable: !0
        });
    }
    function h(e) {
        return "boolean" != typeof e ? Error("Argument type: " + typeof e + ". Please use a boolean.") : (c = e, e ? "adapter.js logging disabled" : "adapter.js logging enabled");
    }
    function u(e) {
        return "boolean" != typeof e ? Error("Argument type: " + typeof e + ". Please use a boolean.") : (l = !e, "adapter.js deprecation warnings " + (e ? "disabled" : "enabled"));
    }
    function f() {
        "object" != typeof window || c || "undefined" == typeof console || "function" != typeof console.log || console.log.apply(console, arguments);
    }
    function m(e, t) {
        l && console.warn(e + " is deprecated, please use " + t + " instead.");
    }
    function g(e) {
        return "[object Object]" === Object.prototype.toString.call(e);
    }
    function y(e, t, n) {
        let r = n ? "outbound-rtp" : "inbound-rtp", i = new Map;
        if (null === t) return i;
        let o = [];
        return e.forEach((e)=>{
            "track" === e.type && e.trackIdentifier === t.id && o.push(e);
        }), o.forEach((t)=>{
            e.forEach((n)=>{
                n.type === r && n.trackId === t.id && function e(t, n, r) {
                    !n || r.has(n.id) || (r.set(n.id, n), Object.keys(n).forEach((i)=>{
                        i.endsWith("Id") ? e(t, t.get(n[i]), r) : i.endsWith("Ids") && n[i].forEach((n)=>{
                            e(t, t.get(n), r);
                        });
                    }));
                }(e, n, i);
            });
        }), i;
    }
    var _, C, v, b, k, S, T, R, w, P, E, D, x, I, M, O, j = {};
    function L(e, t) {
        let n = e && e.navigator;
        if (!n.mediaDevices) return;
        let r = function(e) {
            if ("object" != typeof e || e.mandatory || e.optional) return e;
            let t = {};
            return Object.keys(e).forEach((n)=>{
                if ("require" === n || "advanced" === n || "mediaSource" === n) return;
                let r = "object" == typeof e[n] ? e[n] : {
                    ideal: e[n]
                };
                void 0 !== r.exact && "number" == typeof r.exact && (r.min = r.max = r.exact);
                let i = function(e, t) {
                    return e ? e + t.charAt(0).toUpperCase() + t.slice(1) : "deviceId" === t ? "sourceId" : t;
                };
                if (void 0 !== r.ideal) {
                    t.optional = t.optional || [];
                    let e = {};
                    "number" == typeof r.ideal ? (e[i("min", n)] = r.ideal, t.optional.push(e), (e = {})[i("max", n)] = r.ideal) : e[i("", n)] = r.ideal, t.optional.push(e);
                }
                void 0 !== r.exact && "number" != typeof r.exact ? (t.mandatory = t.mandatory || {}, t.mandatory[i("", n)] = r.exact) : [
                    "min",
                    "max"
                ].forEach((e)=>{
                    void 0 !== r[e] && (t.mandatory = t.mandatory || {}, t.mandatory[i(e, n)] = r[e]);
                });
            }), e.advanced && (t.optional = (t.optional || []).concat(e.advanced)), t;
        }, i = function(e, i) {
            if (t.version >= 61) return i(e);
            if ((e = JSON.parse(JSON.stringify(e))) && "object" == typeof e.audio) {
                let t = function(e, t, n) {
                    t in e && !(n in e) && (e[n] = e[t], delete e[t]);
                };
                t((e = JSON.parse(JSON.stringify(e))).audio, "autoGainControl", "googAutoGainControl"), t(e.audio, "noiseSuppression", "googNoiseSuppression"), e.audio = r(e.audio);
            }
            if (e && "object" == typeof e.video) {
                let o = e.video.facingMode;
                o = o && ("object" == typeof o ? o : {
                    ideal: o
                });
                let s = t.version < 66;
                if (o && ("user" === o.exact || "environment" === o.exact || "user" === o.ideal || "environment" === o.ideal) && !(n.mediaDevices.getSupportedConstraints && n.mediaDevices.getSupportedConstraints().facingMode && !s)) {
                    let t;
                    if (delete e.video.facingMode, "environment" === o.exact || "environment" === o.ideal ? t = [
                        "back",
                        "rear"
                    ] : ("user" === o.exact || "user" === o.ideal) && (t = [
                        "front"
                    ]), t) return n.mediaDevices.enumerateDevices().then((n)=>{
                        let s = (n = n.filter((e)=>"videoinput" === e.kind)).find((e)=>t.some((t)=>e.label.toLowerCase().includes(t)));
                        return !s && n.length && t.includes("back") && (s = n[n.length - 1]), s && (e.video.deviceId = o.exact ? {
                            exact: s.deviceId
                        } : {
                            ideal: s.deviceId
                        }), e.video = r(e.video), f("chrome: " + JSON.stringify(e)), i(e);
                    });
                }
                e.video = r(e.video);
            }
            return f("chrome: " + JSON.stringify(e)), i(e);
        }, o = function(e) {
            return t.version >= 64 ? e : {
                name: ({
                    PermissionDeniedError: "NotAllowedError",
                    PermissionDismissedError: "NotAllowedError",
                    InvalidStateError: "NotAllowedError",
                    DevicesNotFoundError: "NotFoundError",
                    ConstraintNotSatisfiedError: "OverconstrainedError",
                    TrackStartError: "NotReadableError",
                    MediaDeviceFailedDueToShutdown: "NotAllowedError",
                    MediaDeviceKillSwitchOn: "NotAllowedError",
                    TabCaptureError: "AbortError",
                    ScreenCaptureError: "AbortError",
                    DeviceCaptureError: "AbortError"
                })[e.name] || e.name,
                message: e.message,
                constraint: e.constraint || e.constraintName,
                toString () {
                    return this.name + (this.message && ": ") + this.message;
                }
            };
        };
        if (n.getUserMedia = (function(e, t, r) {
            i(e, (e)=>{
                n.webkitGetUserMedia(e, t, (e)=>{
                    r && r(o(e));
                });
            });
        }).bind(n), n.mediaDevices.getUserMedia) {
            let e = n.mediaDevices.getUserMedia.bind(n.mediaDevices);
            n.mediaDevices.getUserMedia = function(t) {
                return i(t, (t)=>e(t).then((e)=>{
                        if (t.audio && !e.getAudioTracks().length || t.video && !e.getVideoTracks().length) throw e.getTracks().forEach((e)=>{
                            e.stop();
                        }), new DOMException("", "NotFoundError");
                        return e;
                    }, (e)=>Promise.reject(o(e))));
            };
        }
    }
    function A(e, t) {
        if ((!e.navigator.mediaDevices || !("getDisplayMedia" in e.navigator.mediaDevices)) && e.navigator.mediaDevices) {
            if ("function" != typeof t) {
                console.error("shimGetDisplayMedia: getSourceId argument is not a function");
                return;
            }
            e.navigator.mediaDevices.getDisplayMedia = function(n) {
                return t(n).then((t)=>{
                    let r = n.video && n.video.width, i = n.video && n.video.height, o = n.video && n.video.frameRate;
                    return n.video = {
                        mandatory: {
                            chromeMediaSource: "desktop",
                            chromeMediaSourceId: t,
                            maxFrameRate: o || 3
                        }
                    }, r && (n.video.mandatory.maxWidth = r), i && (n.video.mandatory.maxHeight = i), e.navigator.mediaDevices.getUserMedia(n);
                });
            };
        }
    }
    function B(e) {
        e.MediaStream = e.MediaStream || e.webkitMediaStream;
    }
    function F(e) {
        if ("object" != typeof e || !e.RTCPeerConnection || "ontrack" in e.RTCPeerConnection.prototype) d(e, "track", (e)=>(e.transceiver || Object.defineProperty(e, "transceiver", {
                value: {
                    receiver: e.receiver
                }
            }), e));
        else {
            Object.defineProperty(e.RTCPeerConnection.prototype, "ontrack", {
                get () {
                    return this._ontrack;
                },
                set (e) {
                    this._ontrack && this.removeEventListener("track", this._ontrack), this.addEventListener("track", this._ontrack = e);
                },
                enumerable: !0,
                configurable: !0
            });
            let t = e.RTCPeerConnection.prototype.setRemoteDescription;
            e.RTCPeerConnection.prototype.setRemoteDescription = function() {
                return this._ontrackpoly || (this._ontrackpoly = (t)=>{
                    t.stream.addEventListener("addtrack", (n)=>{
                        let r;
                        r = e.RTCPeerConnection.prototype.getReceivers ? this.getReceivers().find((e)=>e.track && e.track.id === n.track.id) : {
                            track: n.track
                        };
                        let i = new Event("track");
                        i.track = n.track, i.receiver = r, i.transceiver = {
                            receiver: r
                        }, i.streams = [
                            t.stream
                        ], this.dispatchEvent(i);
                    }), t.stream.getTracks().forEach((n)=>{
                        let r;
                        r = e.RTCPeerConnection.prototype.getReceivers ? this.getReceivers().find((e)=>e.track && e.track.id === n.id) : {
                            track: n
                        };
                        let i = new Event("track");
                        i.track = n, i.receiver = r, i.transceiver = {
                            receiver: r
                        }, i.streams = [
                            t.stream
                        ], this.dispatchEvent(i);
                    });
                }, this.addEventListener("addstream", this._ontrackpoly)), t.apply(this, arguments);
            };
        }
    }
    function U(e) {
        if ("object" == typeof e && e.RTCPeerConnection && !("getSenders" in e.RTCPeerConnection.prototype) && "createDTMFSender" in e.RTCPeerConnection.prototype) {
            let t = function(e, t) {
                return {
                    track: t,
                    get dtmf () {
                        return void 0 === this._dtmf && ("audio" === t.kind ? this._dtmf = e.createDTMFSender(t) : this._dtmf = null), this._dtmf;
                    },
                    _pc: e
                };
            };
            if (!e.RTCPeerConnection.prototype.getSenders) {
                e.RTCPeerConnection.prototype.getSenders = function() {
                    return this._senders = this._senders || [], this._senders.slice();
                };
                let n = e.RTCPeerConnection.prototype.addTrack;
                e.RTCPeerConnection.prototype.addTrack = function(e, r) {
                    let i = n.apply(this, arguments);
                    return i || (i = t(this, e), this._senders.push(i)), i;
                };
                let r = e.RTCPeerConnection.prototype.removeTrack;
                e.RTCPeerConnection.prototype.removeTrack = function(e) {
                    r.apply(this, arguments);
                    let t = this._senders.indexOf(e);
                    -1 !== t && this._senders.splice(t, 1);
                };
            }
            let n = e.RTCPeerConnection.prototype.addStream;
            e.RTCPeerConnection.prototype.addStream = function(e) {
                this._senders = this._senders || [], n.apply(this, [
                    e
                ]), e.getTracks().forEach((e)=>{
                    this._senders.push(t(this, e));
                });
            };
            let r = e.RTCPeerConnection.prototype.removeStream;
            e.RTCPeerConnection.prototype.removeStream = function(e) {
                this._senders = this._senders || [], r.apply(this, [
                    e
                ]), e.getTracks().forEach((e)=>{
                    let t = this._senders.find((t)=>t.track === e);
                    t && this._senders.splice(this._senders.indexOf(t), 1);
                });
            };
        } else if ("object" == typeof e && e.RTCPeerConnection && "getSenders" in e.RTCPeerConnection.prototype && "createDTMFSender" in e.RTCPeerConnection.prototype && e.RTCRtpSender && !("dtmf" in e.RTCRtpSender.prototype)) {
            let t = e.RTCPeerConnection.prototype.getSenders;
            e.RTCPeerConnection.prototype.getSenders = function() {
                let e = t.apply(this, []);
                return e.forEach((e)=>e._pc = this), e;
            }, Object.defineProperty(e.RTCRtpSender.prototype, "dtmf", {
                get () {
                    return void 0 === this._dtmf && ("audio" === this.track.kind ? this._dtmf = this._pc.createDTMFSender(this.track) : this._dtmf = null), this._dtmf;
                }
            });
        }
    }
    function z(e) {
        if (!e.RTCPeerConnection) return;
        let t = e.RTCPeerConnection.prototype.getStats;
        e.RTCPeerConnection.prototype.getStats = function() {
            let [e, n, r] = arguments;
            if (arguments.length > 0 && "function" == typeof e) return t.apply(this, arguments);
            if (0 === t.length && (0 == arguments.length || "function" != typeof e)) return t.apply(this, []);
            let i = function(e) {
                let t = {};
                return e.result().forEach((e)=>{
                    let n = {
                        id: e.id,
                        timestamp: e.timestamp,
                        type: {
                            localcandidate: "local-candidate",
                            remotecandidate: "remote-candidate"
                        }[e.type] || e.type
                    };
                    e.names().forEach((t)=>{
                        n[t] = e.stat(t);
                    }), t[n.id] = n;
                }), t;
            }, o = function(e) {
                return new Map(Object.keys(e).map((t)=>[
                        t,
                        e[t]
                    ]));
            };
            return arguments.length >= 2 ? t.apply(this, [
                function(e) {
                    n(o(i(e)));
                },
                e
            ]) : new Promise((e, n)=>{
                t.apply(this, [
                    function(t) {
                        e(o(i(t)));
                    },
                    n
                ]);
            }).then(n, r);
        };
    }
    function N(e) {
        if (!("object" == typeof e && e.RTCPeerConnection && e.RTCRtpSender && e.RTCRtpReceiver)) return;
        if (!("getStats" in e.RTCRtpSender.prototype)) {
            let t = e.RTCPeerConnection.prototype.getSenders;
            t && (e.RTCPeerConnection.prototype.getSenders = function() {
                let e = t.apply(this, []);
                return e.forEach((e)=>e._pc = this), e;
            });
            let n = e.RTCPeerConnection.prototype.addTrack;
            n && (e.RTCPeerConnection.prototype.addTrack = function() {
                let e = n.apply(this, arguments);
                return e._pc = this, e;
            }), e.RTCRtpSender.prototype.getStats = function() {
                let e = this;
                return this._pc.getStats().then((t)=>y(t, e.track, !0));
            };
        }
        if (!("getStats" in e.RTCRtpReceiver.prototype)) {
            let t = e.RTCPeerConnection.prototype.getReceivers;
            t && (e.RTCPeerConnection.prototype.getReceivers = function() {
                let e = t.apply(this, []);
                return e.forEach((e)=>e._pc = this), e;
            }), d(e, "track", (e)=>(e.receiver._pc = e.srcElement, e)), e.RTCRtpReceiver.prototype.getStats = function() {
                let e = this;
                return this._pc.getStats().then((t)=>y(t, e.track, !1));
            };
        }
        if (!("getStats" in e.RTCRtpSender.prototype && "getStats" in e.RTCRtpReceiver.prototype)) return;
        let t = e.RTCPeerConnection.prototype.getStats;
        e.RTCPeerConnection.prototype.getStats = function() {
            if (arguments.length > 0 && arguments[0] instanceof e.MediaStreamTrack) {
                let e, t, n;
                let r = arguments[0];
                return (this.getSenders().forEach((t)=>{
                    t.track === r && (e ? n = !0 : e = t);
                }), this.getReceivers().forEach((e)=>(e.track === r && (t ? n = !0 : t = e), e.track === r)), n || e && t) ? Promise.reject(new DOMException("There are more than one sender or receiver for the track.", "InvalidAccessError")) : e ? e.getStats() : t ? t.getStats() : Promise.reject(new DOMException("There is no sender or receiver for the track.", "InvalidAccessError"));
            }
            return t.apply(this, arguments);
        };
    }
    function $(e) {
        e.RTCPeerConnection.prototype.getLocalStreams = function() {
            return this._shimmedLocalStreams = this._shimmedLocalStreams || {}, Object.keys(this._shimmedLocalStreams).map((e)=>this._shimmedLocalStreams[e][0]);
        };
        let t = e.RTCPeerConnection.prototype.addTrack;
        e.RTCPeerConnection.prototype.addTrack = function(e, n) {
            if (!n) return t.apply(this, arguments);
            this._shimmedLocalStreams = this._shimmedLocalStreams || {};
            let r = t.apply(this, arguments);
            return this._shimmedLocalStreams[n.id] ? -1 === this._shimmedLocalStreams[n.id].indexOf(r) && this._shimmedLocalStreams[n.id].push(r) : this._shimmedLocalStreams[n.id] = [
                n,
                r
            ], r;
        };
        let n = e.RTCPeerConnection.prototype.addStream;
        e.RTCPeerConnection.prototype.addStream = function(e) {
            this._shimmedLocalStreams = this._shimmedLocalStreams || {}, e.getTracks().forEach((e)=>{
                if (this.getSenders().find((t)=>t.track === e)) throw new DOMException("Track already exists.", "InvalidAccessError");
            });
            let t = this.getSenders();
            n.apply(this, arguments);
            let r = this.getSenders().filter((e)=>-1 === t.indexOf(e));
            this._shimmedLocalStreams[e.id] = [
                e
            ].concat(r);
        };
        let r = e.RTCPeerConnection.prototype.removeStream;
        e.RTCPeerConnection.prototype.removeStream = function(e) {
            return this._shimmedLocalStreams = this._shimmedLocalStreams || {}, delete this._shimmedLocalStreams[e.id], r.apply(this, arguments);
        };
        let i = e.RTCPeerConnection.prototype.removeTrack;
        e.RTCPeerConnection.prototype.removeTrack = function(e) {
            return this._shimmedLocalStreams = this._shimmedLocalStreams || {}, e && Object.keys(this._shimmedLocalStreams).forEach((t)=>{
                let n = this._shimmedLocalStreams[t].indexOf(e);
                -1 !== n && this._shimmedLocalStreams[t].splice(n, 1), 1 === this._shimmedLocalStreams[t].length && delete this._shimmedLocalStreams[t];
            }), i.apply(this, arguments);
        };
    }
    function J(e, t) {
        if (!e.RTCPeerConnection) return;
        if (e.RTCPeerConnection.prototype.addTrack && t.version >= 65) return $(e);
        let n = e.RTCPeerConnection.prototype.getLocalStreams;
        e.RTCPeerConnection.prototype.getLocalStreams = function() {
            let e = n.apply(this);
            return this._reverseStreams = this._reverseStreams || {}, e.map((e)=>this._reverseStreams[e.id]);
        };
        let r = e.RTCPeerConnection.prototype.addStream;
        e.RTCPeerConnection.prototype.addStream = function(t) {
            if (this._streams = this._streams || {}, this._reverseStreams = this._reverseStreams || {}, t.getTracks().forEach((e)=>{
                if (this.getSenders().find((t)=>t.track === e)) throw new DOMException("Track already exists.", "InvalidAccessError");
            }), !this._reverseStreams[t.id]) {
                let n = new e.MediaStream(t.getTracks());
                this._streams[t.id] = n, this._reverseStreams[n.id] = t, t = n;
            }
            r.apply(this, [
                t
            ]);
        };
        let i = e.RTCPeerConnection.prototype.removeStream;
        function o(e, t) {
            let n = t.sdp;
            return Object.keys(e._reverseStreams || []).forEach((t)=>{
                let r = e._reverseStreams[t], i = e._streams[r.id];
                n = n.replace(RegExp(i.id, "g"), r.id);
            }), new RTCSessionDescription({
                type: t.type,
                sdp: n
            });
        }
        e.RTCPeerConnection.prototype.removeStream = function(e) {
            this._streams = this._streams || {}, this._reverseStreams = this._reverseStreams || {}, i.apply(this, [
                this._streams[e.id] || e
            ]), delete this._reverseStreams[this._streams[e.id] ? this._streams[e.id].id : e.id], delete this._streams[e.id];
        }, e.RTCPeerConnection.prototype.addTrack = function(t, n) {
            if ("closed" === this.signalingState) throw new DOMException("The RTCPeerConnection's signalingState is 'closed'.", "InvalidStateError");
            let r = [].slice.call(arguments, 1);
            if (1 !== r.length || !r[0].getTracks().find((e)=>e === t)) throw new DOMException("The adapter.js addTrack polyfill only supports a single  stream which is associated with the specified track.", "NotSupportedError");
            if (this.getSenders().find((e)=>e.track === t)) throw new DOMException("Track already exists.", "InvalidAccessError");
            this._streams = this._streams || {}, this._reverseStreams = this._reverseStreams || {};
            let i = this._streams[n.id];
            if (i) i.addTrack(t), Promise.resolve().then(()=>{
                this.dispatchEvent(new Event("negotiationneeded"));
            });
            else {
                let r = new e.MediaStream([
                    t
                ]);
                this._streams[n.id] = r, this._reverseStreams[r.id] = n, this.addStream(r);
            }
            return this.getSenders().find((e)=>e.track === t);
        }, [
            "createOffer",
            "createAnswer"
        ].forEach(function(t) {
            let n = e.RTCPeerConnection.prototype[t];
            e.RTCPeerConnection.prototype[t] = ({
                [t] () {
                    let e = arguments, t = arguments.length && "function" == typeof arguments[0];
                    return t ? n.apply(this, [
                        (t)=>{
                            let n = o(this, t);
                            e[0].apply(null, [
                                n
                            ]);
                        },
                        (t)=>{
                            e[1] && e[1].apply(null, t);
                        },
                        arguments[2]
                    ]) : n.apply(this, arguments).then((e)=>o(this, e));
                }
            })[t];
        });
        let s = e.RTCPeerConnection.prototype.setLocalDescription;
        e.RTCPeerConnection.prototype.setLocalDescription = function() {
            var e, t;
            let n;
            return arguments.length && arguments[0].type && (arguments[0] = (e = this, t = arguments[0], n = t.sdp, Object.keys(e._reverseStreams || []).forEach((t)=>{
                let r = e._reverseStreams[t], i = e._streams[r.id];
                n = n.replace(RegExp(r.id, "g"), i.id);
            }), new RTCSessionDescription({
                type: t.type,
                sdp: n
            }))), s.apply(this, arguments);
        };
        let a = Object.getOwnPropertyDescriptor(e.RTCPeerConnection.prototype, "localDescription");
        Object.defineProperty(e.RTCPeerConnection.prototype, "localDescription", {
            get () {
                let e = a.get.apply(this);
                return "" === e.type ? e : o(this, e);
            }
        }), e.RTCPeerConnection.prototype.removeTrack = function(e) {
            let t;
            if ("closed" === this.signalingState) throw new DOMException("The RTCPeerConnection's signalingState is 'closed'.", "InvalidStateError");
            if (!e._pc) throw new DOMException("Argument 1 of RTCPeerConnection.removeTrack does not implement interface RTCRtpSender.", "TypeError");
            if (e._pc !== this) throw new DOMException("Sender was not created by this connection.", "InvalidAccessError");
            this._streams = this._streams || {}, Object.keys(this._streams).forEach((n)=>{
                this._streams[n].getTracks().find((t)=>e.track === t) && (t = this._streams[n]);
            }), t && (1 === t.getTracks().length ? this.removeStream(this._reverseStreams[t.id]) : t.removeTrack(e.track), this.dispatchEvent(new Event("negotiationneeded")));
        };
    }
    function V(e, t) {
        !e.RTCPeerConnection && e.webkitRTCPeerConnection && (e.RTCPeerConnection = e.webkitRTCPeerConnection), e.RTCPeerConnection && t.version < 53 && [
            "setLocalDescription",
            "setRemoteDescription",
            "addIceCandidate"
        ].forEach(function(t) {
            let n = e.RTCPeerConnection.prototype[t];
            e.RTCPeerConnection.prototype[t] = ({
                [t] () {
                    return arguments[0] = new ("addIceCandidate" === t ? e.RTCIceCandidate : e.RTCSessionDescription)(arguments[0]), n.apply(this, arguments);
                }
            })[t];
        });
    }
    function G(e, t) {
        d(e, "negotiationneeded", (e)=>{
            let n = e.target;
            if (!(t.version < 72) && (!n.getConfiguration || "plan-b" !== n.getConfiguration().sdpSemantics) || "stable" === n.signalingState) return e;
        });
    }
    e(j, "shimMediaStream", ()=>B), e(j, "shimOnTrack", ()=>F), e(j, "shimGetSendersWithDtmf", ()=>U), e(j, "shimGetStats", ()=>z), e(j, "shimSenderReceiverGetStats", ()=>N), e(j, "shimAddTrackRemoveTrackWithNative", ()=>$), e(j, "shimAddTrackRemoveTrack", ()=>J), e(j, "shimPeerConnection", ()=>V), e(j, "fixNegotiationNeeded", ()=>G), e(j, "shimGetUserMedia", ()=>L), e(j, "shimGetDisplayMedia", ()=>A);
    var W = {};
    function H(e, t) {
        let n = e && e.navigator, r = e && e.MediaStreamTrack;
        if (n.getUserMedia = function(e, t, r) {
            m("navigator.getUserMedia", "navigator.mediaDevices.getUserMedia"), n.mediaDevices.getUserMedia(e).then(t, r);
        }, !(t.version > 55 && "autoGainControl" in n.mediaDevices.getSupportedConstraints())) {
            let e = function(e, t, n) {
                t in e && !(n in e) && (e[n] = e[t], delete e[t]);
            }, t = n.mediaDevices.getUserMedia.bind(n.mediaDevices);
            if (n.mediaDevices.getUserMedia = function(n) {
                return "object" == typeof n && "object" == typeof n.audio && (e((n = JSON.parse(JSON.stringify(n))).audio, "autoGainControl", "mozAutoGainControl"), e(n.audio, "noiseSuppression", "mozNoiseSuppression")), t(n);
            }, r && r.prototype.getSettings) {
                let t = r.prototype.getSettings;
                r.prototype.getSettings = function() {
                    let n = t.apply(this, arguments);
                    return e(n, "mozAutoGainControl", "autoGainControl"), e(n, "mozNoiseSuppression", "noiseSuppression"), n;
                };
            }
            if (r && r.prototype.applyConstraints) {
                let t = r.prototype.applyConstraints;
                r.prototype.applyConstraints = function(n) {
                    return "audio" === this.kind && "object" == typeof n && (e(n = JSON.parse(JSON.stringify(n)), "autoGainControl", "mozAutoGainControl"), e(n, "noiseSuppression", "mozNoiseSuppression")), t.apply(this, [
                        n
                    ]);
                };
            }
        }
    }
    function Y(e, t) {
        e.navigator.mediaDevices && "getDisplayMedia" in e.navigator.mediaDevices || !e.navigator.mediaDevices || (e.navigator.mediaDevices.getDisplayMedia = function(n) {
            if (!(n && n.video)) {
                let e = new DOMException("getDisplayMedia without video constraints is undefined");
                return e.name = "NotFoundError", e.code = 8, Promise.reject(e);
            }
            return !0 === n.video ? n.video = {
                mediaSource: t
            } : n.video.mediaSource = t, e.navigator.mediaDevices.getUserMedia(n);
        });
    }
    function K(e) {
        "object" == typeof e && e.RTCTrackEvent && "receiver" in e.RTCTrackEvent.prototype && !("transceiver" in e.RTCTrackEvent.prototype) && Object.defineProperty(e.RTCTrackEvent.prototype, "transceiver", {
            get () {
                return {
                    receiver: this.receiver
                };
            }
        });
    }
    function X(e, t) {
        if ("object" != typeof e || !(e.RTCPeerConnection || e.mozRTCPeerConnection)) return;
        !e.RTCPeerConnection && e.mozRTCPeerConnection && (e.RTCPeerConnection = e.mozRTCPeerConnection), t.version < 53 && [
            "setLocalDescription",
            "setRemoteDescription",
            "addIceCandidate"
        ].forEach(function(t) {
            let n = e.RTCPeerConnection.prototype[t];
            e.RTCPeerConnection.prototype[t] = ({
                [t] () {
                    return arguments[0] = new ("addIceCandidate" === t ? e.RTCIceCandidate : e.RTCSessionDescription)(arguments[0]), n.apply(this, arguments);
                }
            })[t];
        });
        let n = {
            inboundrtp: "inbound-rtp",
            outboundrtp: "outbound-rtp",
            candidatepair: "candidate-pair",
            localcandidate: "local-candidate",
            remotecandidate: "remote-candidate"
        }, r = e.RTCPeerConnection.prototype.getStats;
        e.RTCPeerConnection.prototype.getStats = function() {
            let [e, i, o] = arguments;
            return r.apply(this, [
                e || null
            ]).then((e)=>{
                if (t.version < 53 && !i) try {
                    e.forEach((e)=>{
                        e.type = n[e.type] || e.type;
                    });
                } catch (t) {
                    if ("TypeError" !== t.name) throw t;
                    e.forEach((t, r)=>{
                        e.set(r, Object.assign({}, t, {
                            type: n[t.type] || t.type
                        }));
                    });
                }
                return e;
            }).then(i, o);
        };
    }
    function q(e) {
        if (!("object" == typeof e && e.RTCPeerConnection && e.RTCRtpSender) || e.RTCRtpSender && "getStats" in e.RTCRtpSender.prototype) return;
        let t = e.RTCPeerConnection.prototype.getSenders;
        t && (e.RTCPeerConnection.prototype.getSenders = function() {
            let e = t.apply(this, []);
            return e.forEach((e)=>e._pc = this), e;
        });
        let n = e.RTCPeerConnection.prototype.addTrack;
        n && (e.RTCPeerConnection.prototype.addTrack = function() {
            let e = n.apply(this, arguments);
            return e._pc = this, e;
        }), e.RTCRtpSender.prototype.getStats = function() {
            return this.track ? this._pc.getStats(this.track) : Promise.resolve(new Map);
        };
    }
    function Q(e) {
        if (!("object" == typeof e && e.RTCPeerConnection && e.RTCRtpSender) || e.RTCRtpSender && "getStats" in e.RTCRtpReceiver.prototype) return;
        let t = e.RTCPeerConnection.prototype.getReceivers;
        t && (e.RTCPeerConnection.prototype.getReceivers = function() {
            let e = t.apply(this, []);
            return e.forEach((e)=>e._pc = this), e;
        }), d(e, "track", (e)=>(e.receiver._pc = e.srcElement, e)), e.RTCRtpReceiver.prototype.getStats = function() {
            return this._pc.getStats(this.track);
        };
    }
    function Z(e) {
        !e.RTCPeerConnection || "removeStream" in e.RTCPeerConnection.prototype || (e.RTCPeerConnection.prototype.removeStream = function(e) {
            m("removeStream", "removeTrack"), this.getSenders().forEach((t)=>{
                t.track && e.getTracks().includes(t.track) && this.removeTrack(t);
            });
        });
    }
    function ee(e) {
        e.DataChannel && !e.RTCDataChannel && (e.RTCDataChannel = e.DataChannel);
    }
    function et(e) {
        if (!("object" == typeof e && e.RTCPeerConnection)) return;
        let t = e.RTCPeerConnection.prototype.addTransceiver;
        t && (e.RTCPeerConnection.prototype.addTransceiver = function() {
            this.setParametersPromises = [];
            let e = arguments[1] && arguments[1].sendEncodings;
            void 0 === e && (e = []);
            let n = (e = [
                ...e
            ]).length > 0;
            n && e.forEach((e)=>{
                if ("rid" in e && !/^[a-z0-9]{0,16}$/i.test(e.rid)) throw TypeError("Invalid RID value provided.");
                if ("scaleResolutionDownBy" in e && !(parseFloat(e.scaleResolutionDownBy) >= 1)) throw RangeError("scale_resolution_down_by must be >= 1.0");
                if ("maxFramerate" in e && !(parseFloat(e.maxFramerate) >= 0)) throw RangeError("max_framerate must be >= 0.0");
            });
            let r = t.apply(this, arguments);
            if (n) {
                let { sender: t } = r, n = t.getParameters();
                "encodings" in n && (1 !== n.encodings.length || 0 !== Object.keys(n.encodings[0]).length) || (n.encodings = e, t.sendEncodings = e, this.setParametersPromises.push(t.setParameters(n).then(()=>{
                    delete t.sendEncodings;
                }).catch(()=>{
                    delete t.sendEncodings;
                })));
            }
            return r;
        });
    }
    function en(e) {
        if (!("object" == typeof e && e.RTCRtpSender)) return;
        let t = e.RTCRtpSender.prototype.getParameters;
        t && (e.RTCRtpSender.prototype.getParameters = function() {
            let e = t.apply(this, arguments);
            return "encodings" in e || (e.encodings = [].concat(this.sendEncodings || [
                {}
            ])), e;
        });
    }
    function er(e) {
        if (!("object" == typeof e && e.RTCPeerConnection)) return;
        let t = e.RTCPeerConnection.prototype.createOffer;
        e.RTCPeerConnection.prototype.createOffer = function() {
            return this.setParametersPromises && this.setParametersPromises.length ? Promise.all(this.setParametersPromises).then(()=>t.apply(this, arguments)).finally(()=>{
                this.setParametersPromises = [];
            }) : t.apply(this, arguments);
        };
    }
    function ei(e) {
        if (!("object" == typeof e && e.RTCPeerConnection)) return;
        let t = e.RTCPeerConnection.prototype.createAnswer;
        e.RTCPeerConnection.prototype.createAnswer = function() {
            return this.setParametersPromises && this.setParametersPromises.length ? Promise.all(this.setParametersPromises).then(()=>t.apply(this, arguments)).finally(()=>{
                this.setParametersPromises = [];
            }) : t.apply(this, arguments);
        };
    }
    e(W, "shimOnTrack", ()=>K), e(W, "shimPeerConnection", ()=>X), e(W, "shimSenderGetStats", ()=>q), e(W, "shimReceiverGetStats", ()=>Q), e(W, "shimRemoveStream", ()=>Z), e(W, "shimRTCDataChannel", ()=>ee), e(W, "shimAddTransceiver", ()=>et), e(W, "shimGetParameters", ()=>en), e(W, "shimCreateOffer", ()=>er), e(W, "shimCreateAnswer", ()=>ei), e(W, "shimGetUserMedia", ()=>H), e(W, "shimGetDisplayMedia", ()=>Y);
    var eo = {};
    function es(e) {
        if ("object" == typeof e && e.RTCPeerConnection) {
            if ("getLocalStreams" in e.RTCPeerConnection.prototype || (e.RTCPeerConnection.prototype.getLocalStreams = function() {
                return this._localStreams || (this._localStreams = []), this._localStreams;
            }), !("addStream" in e.RTCPeerConnection.prototype)) {
                let t = e.RTCPeerConnection.prototype.addTrack;
                e.RTCPeerConnection.prototype.addStream = function(e) {
                    this._localStreams || (this._localStreams = []), this._localStreams.includes(e) || this._localStreams.push(e), e.getAudioTracks().forEach((n)=>t.call(this, n, e)), e.getVideoTracks().forEach((n)=>t.call(this, n, e));
                }, e.RTCPeerConnection.prototype.addTrack = function(e, ...n) {
                    return n && n.forEach((e)=>{
                        this._localStreams ? this._localStreams.includes(e) || this._localStreams.push(e) : this._localStreams = [
                            e
                        ];
                    }), t.apply(this, arguments);
                };
            }
            "removeStream" in e.RTCPeerConnection.prototype || (e.RTCPeerConnection.prototype.removeStream = function(e) {
                this._localStreams || (this._localStreams = []);
                let t = this._localStreams.indexOf(e);
                if (-1 === t) return;
                this._localStreams.splice(t, 1);
                let n = e.getTracks();
                this.getSenders().forEach((e)=>{
                    n.includes(e.track) && this.removeTrack(e);
                });
            });
        }
    }
    function ea(e) {
        if ("object" == typeof e && e.RTCPeerConnection && ("getRemoteStreams" in e.RTCPeerConnection.prototype || (e.RTCPeerConnection.prototype.getRemoteStreams = function() {
            return this._remoteStreams ? this._remoteStreams : [];
        }), !("onaddstream" in e.RTCPeerConnection.prototype))) {
            Object.defineProperty(e.RTCPeerConnection.prototype, "onaddstream", {
                get () {
                    return this._onaddstream;
                },
                set (e) {
                    this._onaddstream && (this.removeEventListener("addstream", this._onaddstream), this.removeEventListener("track", this._onaddstreampoly)), this.addEventListener("addstream", this._onaddstream = e), this.addEventListener("track", this._onaddstreampoly = (e)=>{
                        e.streams.forEach((e)=>{
                            if (this._remoteStreams || (this._remoteStreams = []), this._remoteStreams.includes(e)) return;
                            this._remoteStreams.push(e);
                            let t = new Event("addstream");
                            t.stream = e, this.dispatchEvent(t);
                        });
                    });
                }
            });
            let t = e.RTCPeerConnection.prototype.setRemoteDescription;
            e.RTCPeerConnection.prototype.setRemoteDescription = function() {
                let e = this;
                return this._onaddstreampoly || this.addEventListener("track", this._onaddstreampoly = function(t) {
                    t.streams.forEach((t)=>{
                        if (e._remoteStreams || (e._remoteStreams = []), e._remoteStreams.indexOf(t) >= 0) return;
                        e._remoteStreams.push(t);
                        let n = new Event("addstream");
                        n.stream = t, e.dispatchEvent(n);
                    });
                }), t.apply(e, arguments);
            };
        }
    }
    function ec(e) {
        if ("object" != typeof e || !e.RTCPeerConnection) return;
        let t = e.RTCPeerConnection.prototype, n = t.createOffer, r = t.createAnswer, i = t.setLocalDescription, o = t.setRemoteDescription, s = t.addIceCandidate;
        t.createOffer = function(e, t) {
            let r = arguments.length >= 2 ? arguments[2] : arguments[0], i = n.apply(this, [
                r
            ]);
            return t ? (i.then(e, t), Promise.resolve()) : i;
        }, t.createAnswer = function(e, t) {
            let n = arguments.length >= 2 ? arguments[2] : arguments[0], i = r.apply(this, [
                n
            ]);
            return t ? (i.then(e, t), Promise.resolve()) : i;
        };
        let a = function(e, t, n) {
            let r = i.apply(this, [
                e
            ]);
            return n ? (r.then(t, n), Promise.resolve()) : r;
        };
        t.setLocalDescription = a, a = function(e, t, n) {
            let r = o.apply(this, [
                e
            ]);
            return n ? (r.then(t, n), Promise.resolve()) : r;
        }, t.setRemoteDescription = a, a = function(e, t, n) {
            let r = s.apply(this, [
                e
            ]);
            return n ? (r.then(t, n), Promise.resolve()) : r;
        }, t.addIceCandidate = a;
    }
    function el(e) {
        let t = e && e.navigator;
        if (t.mediaDevices && t.mediaDevices.getUserMedia) {
            let e = t.mediaDevices, n = e.getUserMedia.bind(e);
            t.mediaDevices.getUserMedia = (e)=>n(ep(e));
        }
        !t.getUserMedia && t.mediaDevices && t.mediaDevices.getUserMedia && (t.getUserMedia = (function(e, n, r) {
            t.mediaDevices.getUserMedia(e).then(n, r);
        }).bind(t));
    }
    function ep(e) {
        return e && void 0 !== e.video ? Object.assign({}, e, {
            video: function e(t) {
                return g(t) ? Object.keys(t).reduce(function(n, r) {
                    let i = g(t[r]), o = i ? e(t[r]) : t[r], s = i && !Object.keys(o).length;
                    return void 0 === o || s ? n : Object.assign(n, {
                        [r]: o
                    });
                }, {}) : t;
            }(e.video)
        }) : e;
    }
    function ed(e) {
        if (!e.RTCPeerConnection) return;
        let t = e.RTCPeerConnection;
        e.RTCPeerConnection = function(e, n) {
            if (e && e.iceServers) {
                let t = [];
                for(let n = 0; n < e.iceServers.length; n++){
                    let r = e.iceServers[n];
                    void 0 === r.urls && r.url ? (m("RTCIceServer.url", "RTCIceServer.urls"), (r = JSON.parse(JSON.stringify(r))).urls = r.url, delete r.url, t.push(r)) : t.push(e.iceServers[n]);
                }
                e.iceServers = t;
            }
            return new t(e, n);
        }, e.RTCPeerConnection.prototype = t.prototype, "generateCertificate" in t && Object.defineProperty(e.RTCPeerConnection, "generateCertificate", {
            get: ()=>t.generateCertificate
        });
    }
    function eh(e) {
        "object" == typeof e && e.RTCTrackEvent && "receiver" in e.RTCTrackEvent.prototype && !("transceiver" in e.RTCTrackEvent.prototype) && Object.defineProperty(e.RTCTrackEvent.prototype, "transceiver", {
            get () {
                return {
                    receiver: this.receiver
                };
            }
        });
    }
    function eu(e) {
        let t = e.RTCPeerConnection.prototype.createOffer;
        e.RTCPeerConnection.prototype.createOffer = function(e) {
            if (e) {
                void 0 !== e.offerToReceiveAudio && (e.offerToReceiveAudio = !!e.offerToReceiveAudio);
                let t = this.getTransceivers().find((e)=>"audio" === e.receiver.track.kind);
                !1 === e.offerToReceiveAudio && t ? "sendrecv" === t.direction ? t.setDirection ? t.setDirection("sendonly") : t.direction = "sendonly" : "recvonly" === t.direction && (t.setDirection ? t.setDirection("inactive") : t.direction = "inactive") : !0 !== e.offerToReceiveAudio || t || this.addTransceiver("audio", {
                    direction: "recvonly"
                }), void 0 !== e.offerToReceiveVideo && (e.offerToReceiveVideo = !!e.offerToReceiveVideo);
                let n = this.getTransceivers().find((e)=>"video" === e.receiver.track.kind);
                !1 === e.offerToReceiveVideo && n ? "sendrecv" === n.direction ? n.setDirection ? n.setDirection("sendonly") : n.direction = "sendonly" : "recvonly" === n.direction && (n.setDirection ? n.setDirection("inactive") : n.direction = "inactive") : !0 !== e.offerToReceiveVideo || n || this.addTransceiver("video", {
                    direction: "recvonly"
                });
            }
            return t.apply(this, arguments);
        };
    }
    function ef(e) {
        "object" != typeof e || e.AudioContext || (e.AudioContext = e.webkitAudioContext);
    }
    e(eo, "shimLocalStreamsAPI", ()=>es), e(eo, "shimRemoteStreamsAPI", ()=>ea), e(eo, "shimCallbacksAPI", ()=>ec), e(eo, "shimGetUserMedia", ()=>el), e(eo, "shimConstraints", ()=>ep), e(eo, "shimRTCIceServerUrls", ()=>ed), e(eo, "shimTrackEventTransceiver", ()=>eh), e(eo, "shimCreateOfferLegacy", ()=>eu), e(eo, "shimAudioContext", ()=>ef);
    var em = {};
    e(em, "shimRTCIceCandidate", ()=>e_), e(em, "shimRTCIceCandidateRelayProtocol", ()=>eC), e(em, "shimMaxMessageSize", ()=>ev), e(em, "shimSendThrowTypeError", ()=>eb), e(em, "shimConnectionState", ()=>ek), e(em, "removeExtmapAllowMixed", ()=>eS), e(em, "shimAddIceCandidateNullOrEmpty", ()=>eT), e(em, "shimParameterlessSetLocalDescription", ()=>eR);
    var eg = {};
    let ey = {};
    function e_(e) {
        if (!e.RTCIceCandidate || e.RTCIceCandidate && "foundation" in e.RTCIceCandidate.prototype) return;
        let n = e.RTCIceCandidate;
        e.RTCIceCandidate = function(e) {
            if ("object" == typeof e && e.candidate && 0 === e.candidate.indexOf("a=") && ((e = JSON.parse(JSON.stringify(e))).candidate = e.candidate.substring(2)), e.candidate && e.candidate.length) {
                let r = new n(e), i = t(eg).parseCandidate(e.candidate);
                for(let e in i)e in r || Object.defineProperty(r, e, {
                    value: i[e]
                });
                return r.toJSON = function() {
                    return {
                        candidate: r.candidate,
                        sdpMid: r.sdpMid,
                        sdpMLineIndex: r.sdpMLineIndex,
                        usernameFragment: r.usernameFragment
                    };
                }, r;
            }
            return new n(e);
        }, e.RTCIceCandidate.prototype = n.prototype, d(e, "icecandidate", (t)=>(t.candidate && Object.defineProperty(t, "candidate", {
                value: new e.RTCIceCandidate(t.candidate),
                writable: "false"
            }), t));
    }
    function eC(e) {
        !e.RTCIceCandidate || e.RTCIceCandidate && "relayProtocol" in e.RTCIceCandidate.prototype || d(e, "icecandidate", (e)=>{
            if (e.candidate) {
                let n = t(eg).parseCandidate(e.candidate.candidate);
                "relay" === n.type && (e.candidate.relayProtocol = ({
                    0: "tls",
                    1: "tcp",
                    2: "udp"
                })[n.priority >> 24]);
            }
            return e;
        });
    }
    function ev(e, n) {
        if (!e.RTCPeerConnection) return;
        "sctp" in e.RTCPeerConnection.prototype || Object.defineProperty(e.RTCPeerConnection.prototype, "sctp", {
            get () {
                return void 0 === this._sctp ? null : this._sctp;
            }
        });
        let r = function(e) {
            if (!e || !e.sdp) return !1;
            let n = t(eg).splitSections(e.sdp);
            return n.shift(), n.some((e)=>{
                let n = t(eg).parseMLine(e);
                return n && "application" === n.kind && -1 !== n.protocol.indexOf("SCTP");
            });
        }, i = function(e) {
            let t = e.sdp.match(/mozilla...THIS_IS_SDPARTA-(\d+)/);
            if (null === t || t.length < 2) return -1;
            let n = parseInt(t[1], 10);
            return n != n ? -1 : n;
        }, o = function(e) {
            let t = 65536;
            return "firefox" === n.browser && (t = n.version < 57 ? -1 === e ? 16384 : 2147483637 : n.version < 60 ? 57 === n.version ? 65535 : 65536 : 2147483637), t;
        }, s = function(e, r) {
            let i = 65536;
            "firefox" === n.browser && 57 === n.version && (i = 65535);
            let o = t(eg).matchPrefix(e.sdp, "a=max-message-size:");
            return o.length > 0 ? i = parseInt(o[0].substring(19), 10) : "firefox" === n.browser && -1 !== r && (i = 2147483637), i;
        }, a = e.RTCPeerConnection.prototype.setRemoteDescription;
        e.RTCPeerConnection.prototype.setRemoteDescription = function() {
            if (this._sctp = null, "chrome" === n.browser && n.version >= 76) {
                let { sdpSemantics: e } = this.getConfiguration();
                "plan-b" === e && Object.defineProperty(this, "sctp", {
                    get () {
                        return void 0 === this._sctp ? null : this._sctp;
                    },
                    enumerable: !0,
                    configurable: !0
                });
            }
            if (r(arguments[0])) {
                let e;
                let t = i(arguments[0]), n = o(t), r = s(arguments[0], t);
                e = 0 === n && 0 === r ? Number.POSITIVE_INFINITY : 0 === n || 0 === r ? Math.max(n, r) : Math.min(n, r);
                let a = {};
                Object.defineProperty(a, "maxMessageSize", {
                    get: ()=>e
                }), this._sctp = a;
            }
            return a.apply(this, arguments);
        };
    }
    function eb(e) {
        if (!(e.RTCPeerConnection && "createDataChannel" in e.RTCPeerConnection.prototype)) return;
        function t(e, t) {
            let n = e.send;
            e.send = function() {
                let r = arguments[0], i = r.length || r.size || r.byteLength;
                if ("open" === e.readyState && t.sctp && i > t.sctp.maxMessageSize) throw TypeError("Message too large (can send a maximum of " + t.sctp.maxMessageSize + " bytes)");
                return n.apply(e, arguments);
            };
        }
        let n = e.RTCPeerConnection.prototype.createDataChannel;
        e.RTCPeerConnection.prototype.createDataChannel = function() {
            let e = n.apply(this, arguments);
            return t(e, this), e;
        }, d(e, "datachannel", (e)=>(t(e.channel, e.target), e));
    }
    function ek(e) {
        if (!e.RTCPeerConnection || "connectionState" in e.RTCPeerConnection.prototype) return;
        let t = e.RTCPeerConnection.prototype;
        Object.defineProperty(t, "connectionState", {
            get () {
                return ({
                    completed: "connected",
                    checking: "connecting"
                })[this.iceConnectionState] || this.iceConnectionState;
            },
            enumerable: !0,
            configurable: !0
        }), Object.defineProperty(t, "onconnectionstatechange", {
            get () {
                return this._onconnectionstatechange || null;
            },
            set (e) {
                this._onconnectionstatechange && (this.removeEventListener("connectionstatechange", this._onconnectionstatechange), delete this._onconnectionstatechange), e && this.addEventListener("connectionstatechange", this._onconnectionstatechange = e);
            },
            enumerable: !0,
            configurable: !0
        }), [
            "setLocalDescription",
            "setRemoteDescription"
        ].forEach((e)=>{
            let n = t[e];
            t[e] = function() {
                return this._connectionstatechangepoly || (this._connectionstatechangepoly = (e)=>{
                    let t = e.target;
                    if (t._lastConnectionState !== t.connectionState) {
                        t._lastConnectionState = t.connectionState;
                        let n = new Event("connectionstatechange", e);
                        t.dispatchEvent(n);
                    }
                    return e;
                }, this.addEventListener("iceconnectionstatechange", this._connectionstatechangepoly)), n.apply(this, arguments);
            };
        });
    }
    function eS(e, t) {
        if (!e.RTCPeerConnection || "chrome" === t.browser && t.version >= 71 || "safari" === t.browser && t.version >= 605) return;
        let n = e.RTCPeerConnection.prototype.setRemoteDescription;
        e.RTCPeerConnection.prototype.setRemoteDescription = function(t) {
            if (t && t.sdp && -1 !== t.sdp.indexOf("\na=extmap-allow-mixed")) {
                let n = t.sdp.split("\n").filter((e)=>"a=extmap-allow-mixed" !== e.trim()).join("\n");
                e.RTCSessionDescription && t instanceof e.RTCSessionDescription ? arguments[0] = new e.RTCSessionDescription({
                    type: t.type,
                    sdp: n
                }) : t.sdp = n;
            }
            return n.apply(this, arguments);
        };
    }
    function eT(e, t) {
        if (!(e.RTCPeerConnection && e.RTCPeerConnection.prototype)) return;
        let n = e.RTCPeerConnection.prototype.addIceCandidate;
        n && 0 !== n.length && (e.RTCPeerConnection.prototype.addIceCandidate = function() {
            return arguments[0] ? ("chrome" === t.browser && t.version < 78 || "firefox" === t.browser && t.version < 68 || "safari" === t.browser) && arguments[0] && "" === arguments[0].candidate ? Promise.resolve() : n.apply(this, arguments) : (arguments[1] && arguments[1].apply(null), Promise.resolve());
        });
    }
    function eR(e, t) {
        if (!(e.RTCPeerConnection && e.RTCPeerConnection.prototype)) return;
        let n = e.RTCPeerConnection.prototype.setLocalDescription;
        n && 0 !== n.length && (e.RTCPeerConnection.prototype.setLocalDescription = function() {
            let e = arguments[0] || {};
            if ("object" != typeof e || e.type && e.sdp) return n.apply(this, arguments);
            if (!(e = {
                type: e.type,
                sdp: e.sdp
            }).type) switch(this.signalingState){
                case "stable":
                case "have-local-offer":
                case "have-remote-pranswer":
                    e.type = "offer";
                    break;
                default:
                    e.type = "answer";
            }
            return e.sdp || "offer" !== e.type && "answer" !== e.type ? n.apply(this, [
                e
            ]) : ("offer" === e.type ? this.createOffer : this.createAnswer).apply(this).then((e)=>n.apply(this, [
                    e
                ]));
        });
    }
    ey.generateIdentifier = function() {
        return Math.random().toString(36).substring(2, 12);
    }, ey.localCName = ey.generateIdentifier(), ey.splitLines = function(e) {
        return e.trim().split("\n").map((e)=>e.trim());
    }, ey.splitSections = function(e) {
        return e.split("\nm=").map((e, t)=>(t > 0 ? "m=" + e : e).trim() + "\r\n");
    }, ey.getDescription = function(e) {
        let t = ey.splitSections(e);
        return t && t[0];
    }, ey.getMediaSections = function(e) {
        let t = ey.splitSections(e);
        return t.shift(), t;
    }, ey.matchPrefix = function(e, t) {
        return ey.splitLines(e).filter((e)=>0 === e.indexOf(t));
    }, ey.parseCandidate = function(e) {
        let t;
        let n = {
            foundation: (t = 0 === e.indexOf("a=candidate:") ? e.substring(12).split(" ") : e.substring(10).split(" "))[0],
            component: {
                1: "rtp",
                2: "rtcp"
            }[t[1]] || t[1],
            protocol: t[2].toLowerCase(),
            priority: parseInt(t[3], 10),
            ip: t[4],
            address: t[4],
            port: parseInt(t[5], 10),
            type: t[7]
        };
        for(let e = 8; e < t.length; e += 2)switch(t[e]){
            case "raddr":
                n.relatedAddress = t[e + 1];
                break;
            case "rport":
                n.relatedPort = parseInt(t[e + 1], 10);
                break;
            case "tcptype":
                n.tcpType = t[e + 1];
                break;
            case "ufrag":
                n.ufrag = t[e + 1], n.usernameFragment = t[e + 1];
                break;
            default:
                void 0 === n[t[e]] && (n[t[e]] = t[e + 1]);
        }
        return n;
    }, ey.writeCandidate = function(e) {
        let t = [];
        t.push(e.foundation);
        let n = e.component;
        "rtp" === n ? t.push(1) : "rtcp" === n ? t.push(2) : t.push(n), t.push(e.protocol.toUpperCase()), t.push(e.priority), t.push(e.address || e.ip), t.push(e.port);
        let r = e.type;
        return t.push("typ"), t.push(r), "host" !== r && e.relatedAddress && e.relatedPort && (t.push("raddr"), t.push(e.relatedAddress), t.push("rport"), t.push(e.relatedPort)), e.tcpType && "tcp" === e.protocol.toLowerCase() && (t.push("tcptype"), t.push(e.tcpType)), (e.usernameFragment || e.ufrag) && (t.push("ufrag"), t.push(e.usernameFragment || e.ufrag)), "candidate:" + t.join(" ");
    }, ey.parseIceOptions = function(e) {
        return e.substring(14).split(" ");
    }, ey.parseRtpMap = function(e) {
        let t = e.substring(9).split(" "), n = {
            payloadType: parseInt(t.shift(), 10)
        };
        return t = t[0].split("/"), n.name = t[0], n.clockRate = parseInt(t[1], 10), n.channels = 3 === t.length ? parseInt(t[2], 10) : 1, n.numChannels = n.channels, n;
    }, ey.writeRtpMap = function(e) {
        let t = e.payloadType;
        void 0 !== e.preferredPayloadType && (t = e.preferredPayloadType);
        let n = e.channels || e.numChannels || 1;
        return "a=rtpmap:" + t + " " + e.name + "/" + e.clockRate + (1 !== n ? "/" + n : "") + "\r\n";
    }, ey.parseExtmap = function(e) {
        let t = e.substring(9).split(" ");
        return {
            id: parseInt(t[0], 10),
            direction: t[0].indexOf("/") > 0 ? t[0].split("/")[1] : "sendrecv",
            uri: t[1],
            attributes: t.slice(2).join(" ")
        };
    }, ey.writeExtmap = function(e) {
        return "a=extmap:" + (e.id || e.preferredId) + (e.direction && "sendrecv" !== e.direction ? "/" + e.direction : "") + " " + e.uri + (e.attributes ? " " + e.attributes : "") + "\r\n";
    }, ey.parseFmtp = function(e) {
        let t;
        let n = {}, r = e.substring(e.indexOf(" ") + 1).split(";");
        for(let e = 0; e < r.length; e++)n[(t = r[e].trim().split("="))[0].trim()] = t[1];
        return n;
    }, ey.writeFmtp = function(e) {
        let t = "", n = e.payloadType;
        if (void 0 !== e.preferredPayloadType && (n = e.preferredPayloadType), e.parameters && Object.keys(e.parameters).length) {
            let r = [];
            Object.keys(e.parameters).forEach((t)=>{
                void 0 !== e.parameters[t] ? r.push(t + "=" + e.parameters[t]) : r.push(t);
            }), t += "a=fmtp:" + n + " " + r.join(";") + "\r\n";
        }
        return t;
    }, ey.parseRtcpFb = function(e) {
        let t = e.substring(e.indexOf(" ") + 1).split(" ");
        return {
            type: t.shift(),
            parameter: t.join(" ")
        };
    }, ey.writeRtcpFb = function(e) {
        let t = "", n = e.payloadType;
        return void 0 !== e.preferredPayloadType && (n = e.preferredPayloadType), e.rtcpFeedback && e.rtcpFeedback.length && e.rtcpFeedback.forEach((e)=>{
            t += "a=rtcp-fb:" + n + " " + e.type + (e.parameter && e.parameter.length ? " " + e.parameter : "") + "\r\n";
        }), t;
    }, ey.parseSsrcMedia = function(e) {
        let t = e.indexOf(" "), n = {
            ssrc: parseInt(e.substring(7, t), 10)
        }, r = e.indexOf(":", t);
        return r > -1 ? (n.attribute = e.substring(t + 1, r), n.value = e.substring(r + 1)) : n.attribute = e.substring(t + 1), n;
    }, ey.parseSsrcGroup = function(e) {
        let t = e.substring(13).split(" ");
        return {
            semantics: t.shift(),
            ssrcs: t.map((e)=>parseInt(e, 10))
        };
    }, ey.getMid = function(e) {
        let t = ey.matchPrefix(e, "a=mid:")[0];
        if (t) return t.substring(6);
    }, ey.parseFingerprint = function(e) {
        let t = e.substring(14).split(" ");
        return {
            algorithm: t[0].toLowerCase(),
            value: t[1].toUpperCase()
        };
    }, ey.getDtlsParameters = function(e, t) {
        return {
            role: "auto",
            fingerprints: ey.matchPrefix(e + t, "a=fingerprint:").map(ey.parseFingerprint)
        };
    }, ey.writeDtlsParameters = function(e, t) {
        let n = "a=setup:" + t + "\r\n";
        return e.fingerprints.forEach((e)=>{
            n += "a=fingerprint:" + e.algorithm + " " + e.value + "\r\n";
        }), n;
    }, ey.parseCryptoLine = function(e) {
        let t = e.substring(9).split(" ");
        return {
            tag: parseInt(t[0], 10),
            cryptoSuite: t[1],
            keyParams: t[2],
            sessionParams: t.slice(3)
        };
    }, ey.writeCryptoLine = function(e) {
        return "a=crypto:" + e.tag + " " + e.cryptoSuite + " " + ("object" == typeof e.keyParams ? ey.writeCryptoKeyParams(e.keyParams) : e.keyParams) + (e.sessionParams ? " " + e.sessionParams.join(" ") : "") + "\r\n";
    }, ey.parseCryptoKeyParams = function(e) {
        if (0 !== e.indexOf("inline:")) return null;
        let t = e.substring(7).split("|");
        return {
            keyMethod: "inline",
            keySalt: t[0],
            lifeTime: t[1],
            mkiValue: t[2] ? t[2].split(":")[0] : void 0,
            mkiLength: t[2] ? t[2].split(":")[1] : void 0
        };
    }, ey.writeCryptoKeyParams = function(e) {
        return e.keyMethod + ":" + e.keySalt + (e.lifeTime ? "|" + e.lifeTime : "") + (e.mkiValue && e.mkiLength ? "|" + e.mkiValue + ":" + e.mkiLength : "");
    }, ey.getCryptoParameters = function(e, t) {
        return ey.matchPrefix(e + t, "a=crypto:").map(ey.parseCryptoLine);
    }, ey.getIceParameters = function(e, t) {
        let n = ey.matchPrefix(e + t, "a=ice-ufrag:")[0], r = ey.matchPrefix(e + t, "a=ice-pwd:")[0];
        return n && r ? {
            usernameFragment: n.substring(12),
            password: r.substring(10)
        } : null;
    }, ey.writeIceParameters = function(e) {
        let t = "a=ice-ufrag:" + e.usernameFragment + "\r\na=ice-pwd:" + e.password + "\r\n";
        return e.iceLite && (t += "a=ice-lite\r\n"), t;
    }, ey.parseRtpParameters = function(e) {
        let t = {
            codecs: [],
            headerExtensions: [],
            fecMechanisms: [],
            rtcp: []
        }, n = ey.splitLines(e)[0].split(" ");
        t.profile = n[2];
        for(let r = 3; r < n.length; r++){
            let i = n[r], o = ey.matchPrefix(e, "a=rtpmap:" + i + " ")[0];
            if (o) {
                let n = ey.parseRtpMap(o), r = ey.matchPrefix(e, "a=fmtp:" + i + " ");
                switch(n.parameters = r.length ? ey.parseFmtp(r[0]) : {}, n.rtcpFeedback = ey.matchPrefix(e, "a=rtcp-fb:" + i + " ").map(ey.parseRtcpFb), t.codecs.push(n), n.name.toUpperCase()){
                    case "RED":
                    case "ULPFEC":
                        t.fecMechanisms.push(n.name.toUpperCase());
                }
            }
        }
        ey.matchPrefix(e, "a=extmap:").forEach((e)=>{
            t.headerExtensions.push(ey.parseExtmap(e));
        });
        let r = ey.matchPrefix(e, "a=rtcp-fb:* ").map(ey.parseRtcpFb);
        return t.codecs.forEach((e)=>{
            r.forEach((t)=>{
                e.rtcpFeedback.find((e)=>e.type === t.type && e.parameter === t.parameter) || e.rtcpFeedback.push(t);
            });
        }), t;
    }, ey.writeRtpDescription = function(e, t) {
        let n = "";
        n += "m=" + e + " " + (t.codecs.length > 0 ? "9" : "0") + " " + (t.profile || "UDP/TLS/RTP/SAVPF") + " " + t.codecs.map((e)=>void 0 !== e.preferredPayloadType ? e.preferredPayloadType : e.payloadType).join(" ") + "\r\nc=IN IP4 0.0.0.0\r\na=rtcp:9 IN IP4 0.0.0.0\r\n", t.codecs.forEach((e)=>{
            n += ey.writeRtpMap(e) + ey.writeFmtp(e) + ey.writeRtcpFb(e);
        });
        let r = 0;
        return t.codecs.forEach((e)=>{
            e.maxptime > r && (r = e.maxptime);
        }), r > 0 && (n += "a=maxptime:" + r + "\r\n"), t.headerExtensions && t.headerExtensions.forEach((e)=>{
            n += ey.writeExtmap(e);
        }), n;
    }, ey.parseRtpEncodingParameters = function(e) {
        let t;
        let n = [], r = ey.parseRtpParameters(e), i = -1 !== r.fecMechanisms.indexOf("RED"), o = -1 !== r.fecMechanisms.indexOf("ULPFEC"), s = ey.matchPrefix(e, "a=ssrc:").map((e)=>ey.parseSsrcMedia(e)).filter((e)=>"cname" === e.attribute), a = s.length > 0 && s[0].ssrc, c = ey.matchPrefix(e, "a=ssrc-group:FID").map((e)=>e.substring(17).split(" ").map((e)=>parseInt(e, 10)));
        c.length > 0 && c[0].length > 1 && c[0][0] === a && (t = c[0][1]), r.codecs.forEach((e)=>{
            if ("RTX" === e.name.toUpperCase() && e.parameters.apt) {
                let r = {
                    ssrc: a,
                    codecPayloadType: parseInt(e.parameters.apt, 10)
                };
                a && t && (r.rtx = {
                    ssrc: t
                }), n.push(r), i && ((r = JSON.parse(JSON.stringify(r))).fec = {
                    ssrc: a,
                    mechanism: o ? "red+ulpfec" : "red"
                }, n.push(r));
            }
        }), 0 === n.length && a && n.push({
            ssrc: a
        });
        let l = ey.matchPrefix(e, "b=");
        return l.length && (l = 0 === l[0].indexOf("b=TIAS:") ? parseInt(l[0].substring(7), 10) : 0 === l[0].indexOf("b=AS:") ? 950 * parseInt(l[0].substring(5), 10) - 16e3 : void 0, n.forEach((e)=>{
            e.maxBitrate = l;
        })), n;
    }, ey.parseRtcpParameters = function(e) {
        let t = {}, n = ey.matchPrefix(e, "a=ssrc:").map((e)=>ey.parseSsrcMedia(e)).filter((e)=>"cname" === e.attribute)[0];
        n && (t.cname = n.value, t.ssrc = n.ssrc);
        let r = ey.matchPrefix(e, "a=rtcp-rsize");
        t.reducedSize = r.length > 0, t.compound = 0 === r.length;
        let i = ey.matchPrefix(e, "a=rtcp-mux");
        return t.mux = i.length > 0, t;
    }, ey.writeRtcpParameters = function(e) {
        let t = "";
        return e.reducedSize && (t += "a=rtcp-rsize\r\n"), e.mux && (t += "a=rtcp-mux\r\n"), void 0 !== e.ssrc && e.cname && (t += "a=ssrc:" + e.ssrc + " cname:" + e.cname + "\r\n"), t;
    }, ey.parseMsid = function(e) {
        let t;
        let n = ey.matchPrefix(e, "a=msid:");
        if (1 === n.length) return {
            stream: (t = n[0].substring(7).split(" "))[0],
            track: t[1]
        };
        let r = ey.matchPrefix(e, "a=ssrc:").map((e)=>ey.parseSsrcMedia(e)).filter((e)=>"msid" === e.attribute);
        if (r.length > 0) return {
            stream: (t = r[0].value.split(" "))[0],
            track: t[1]
        };
    }, ey.parseSctpDescription = function(e) {
        let t;
        let n = ey.parseMLine(e), r = ey.matchPrefix(e, "a=max-message-size:");
        r.length > 0 && (t = parseInt(r[0].substring(19), 10)), isNaN(t) && (t = 65536);
        let i = ey.matchPrefix(e, "a=sctp-port:");
        if (i.length > 0) return {
            port: parseInt(i[0].substring(12), 10),
            protocol: n.fmt,
            maxMessageSize: t
        };
        let o = ey.matchPrefix(e, "a=sctpmap:");
        if (o.length > 0) {
            let e = o[0].substring(10).split(" ");
            return {
                port: parseInt(e[0], 10),
                protocol: e[1],
                maxMessageSize: t
            };
        }
    }, ey.writeSctpDescription = function(e, t) {
        let n = [];
        return n = "DTLS/SCTP" !== e.protocol ? [
            "m=" + e.kind + " 9 " + e.protocol + " " + t.protocol + "\r\n",
            "c=IN IP4 0.0.0.0\r\n",
            "a=sctp-port:" + t.port + "\r\n"
        ] : [
            "m=" + e.kind + " 9 " + e.protocol + " " + t.port + "\r\n",
            "c=IN IP4 0.0.0.0\r\n",
            "a=sctpmap:" + t.port + " " + t.protocol + " 65535\r\n"
        ], void 0 !== t.maxMessageSize && n.push("a=max-message-size:" + t.maxMessageSize + "\r\n"), n.join("");
    }, ey.generateSessionId = function() {
        return Math.random().toString().substr(2, 22);
    }, ey.writeSessionBoilerplate = function(e, t, n) {
        return "v=0\r\no=" + (n || "thisisadapterortc") + " " + (e || ey.generateSessionId()) + " " + (void 0 !== t ? t : 2) + " IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\n";
    }, ey.getDirection = function(e, t) {
        let n = ey.splitLines(e);
        for(let e = 0; e < n.length; e++)switch(n[e]){
            case "a=sendrecv":
            case "a=sendonly":
            case "a=recvonly":
            case "a=inactive":
                return n[e].substring(2);
        }
        return t ? ey.getDirection(t) : "sendrecv";
    }, ey.getKind = function(e) {
        return ey.splitLines(e)[0].split(" ")[0].substring(2);
    }, ey.isRejected = function(e) {
        return "0" === e.split(" ", 2)[1];
    }, ey.parseMLine = function(e) {
        let t = ey.splitLines(e)[0].substring(2).split(" ");
        return {
            kind: t[0],
            port: parseInt(t[1], 10),
            protocol: t[2],
            fmt: t.slice(3).join(" ")
        };
    }, ey.parseOLine = function(e) {
        let t = ey.matchPrefix(e, "o=")[0].substring(2).split(" ");
        return {
            username: t[0],
            sessionId: t[1],
            sessionVersion: parseInt(t[2], 10),
            netType: t[3],
            addressType: t[4],
            address: t[5]
        };
    }, ey.isValidSDP = function(e) {
        if ("string" != typeof e || 0 === e.length) return !1;
        let t = ey.splitLines(e);
        for(let e = 0; e < t.length; e++)if (t[e].length < 2 || "=" !== t[e].charAt(1)) return !1;
        return !0;
    }, eg = ey;
    let ew = function({ window: e } = {}, t = {
        shimChrome: !0,
        shimFirefox: !0,
        shimSafari: !0
    }) {
        let n = function(e) {
            let t = {
                browser: null,
                version: null
            };
            if (void 0 === e || !e.navigator || !e.navigator.userAgent) return t.browser = "Not a browser.", t;
            let { navigator: n } = e;
            return n.mozGetUserMedia ? (t.browser = "firefox", t.version = p(n.userAgent, /Firefox\/(\d+)\./, 1)) : n.webkitGetUserMedia || !1 === e.isSecureContext && e.webkitRTCPeerConnection ? (t.browser = "chrome", t.version = p(n.userAgent, /Chrom(e|ium)\/(\d+)\./, 2)) : e.RTCPeerConnection && n.userAgent.match(/AppleWebKit\/(\d+)\./) ? (t.browser = "safari", t.version = p(n.userAgent, /AppleWebKit\/(\d+)\./, 1), t.supportsUnifiedPlan = e.RTCRtpTransceiver && "currentDirection" in e.RTCRtpTransceiver.prototype) : t.browser = "Not a supported browser.", t;
        }(e), r = {
            browserDetails: n,
            commonShim: em,
            extractVersion: p,
            disableLog: h,
            disableWarnings: u,
            sdp: eg
        };
        switch(n.browser){
            case "chrome":
                if (!j || !j.shimPeerConnection || !t.shimChrome) {
                    f("Chrome shim is not included in this adapter release.");
                    break;
                }
                if (null === n.version) {
                    f("Chrome shim can not determine version, not shimming.");
                    break;
                }
                f("adapter.js shimming chrome."), r.browserShim = j, eT(e, n), eR(e, n), j.shimGetUserMedia(e, n), j.shimMediaStream(e, n), j.shimPeerConnection(e, n), j.shimOnTrack(e, n), j.shimAddTrackRemoveTrack(e, n), j.shimGetSendersWithDtmf(e, n), j.shimGetStats(e, n), j.shimSenderReceiverGetStats(e, n), j.fixNegotiationNeeded(e, n), e_(e, n), eC(e, n), ek(e, n), ev(e, n), eb(e, n), eS(e, n);
                break;
            case "firefox":
                if (!W || !W.shimPeerConnection || !t.shimFirefox) {
                    f("Firefox shim is not included in this adapter release.");
                    break;
                }
                f("adapter.js shimming firefox."), r.browserShim = W, eT(e, n), eR(e, n), W.shimGetUserMedia(e, n), W.shimPeerConnection(e, n), W.shimOnTrack(e, n), W.shimRemoveStream(e, n), W.shimSenderGetStats(e, n), W.shimReceiverGetStats(e, n), W.shimRTCDataChannel(e, n), W.shimAddTransceiver(e, n), W.shimGetParameters(e, n), W.shimCreateOffer(e, n), W.shimCreateAnswer(e, n), e_(e, n), ek(e, n), ev(e, n), eb(e, n);
                break;
            case "safari":
                if (!eo || !t.shimSafari) {
                    f("Safari shim is not included in this adapter release.");
                    break;
                }
                f("adapter.js shimming safari."), r.browserShim = eo, eT(e, n), eR(e, n), eo.shimRTCIceServerUrls(e, n), eo.shimCreateOfferLegacy(e, n), eo.shimCallbacksAPI(e, n), eo.shimLocalStreamsAPI(e, n), eo.shimRemoteStreamsAPI(e, n), eo.shimTrackEventTransceiver(e, n), eo.shimGetUserMedia(e, n), eo.shimAudioContext(e, n), e_(e, n), eC(e, n), ev(e, n), eb(e, n), eS(e, n);
                break;
            default:
                f("Unsupported browser!");
        }
        return r;
    }({
        window: "undefined" == typeof window ? void 0 : window
    }), eP = ew.default || ew, eE = new class {
        isWebRTCSupported() {
            return "undefined" != typeof RTCPeerConnection;
        }
        isBrowserSupported() {
            let e = this.getBrowser(), t = this.getVersion();
            return !!this.supportedBrowsers.includes(e) && ("chrome" === e ? t >= this.minChromeVersion : "firefox" === e ? t >= this.minFirefoxVersion : "safari" === e && !this.isIOS && t >= this.minSafariVersion);
        }
        getBrowser() {
            return eP.browserDetails.browser;
        }
        getVersion() {
            return eP.browserDetails.version || 0;
        }
        isUnifiedPlanSupported() {
            let e;
            let t = this.getBrowser(), n = eP.browserDetails.version || 0;
            if ("chrome" === t && n < this.minChromeVersion) return !1;
            if ("firefox" === t && n >= this.minFirefoxVersion) return !0;
            if (!window.RTCRtpTransceiver || !("currentDirection" in RTCRtpTransceiver.prototype)) return !1;
            let r = !1;
            try {
                (e = new RTCPeerConnection).addTransceiver("audio"), r = !0;
            } catch (e) {} finally{
                e && e.close();
            }
            return r;
        }
        toString() {
            return `Supports:
    browser:${this.getBrowser()}
    version:${this.getVersion()}
    isIOS:${this.isIOS}
    isWebRTCSupported:${this.isWebRTCSupported()}
    isBrowserSupported:${this.isBrowserSupported()}
    isUnifiedPlanSupported:${this.isUnifiedPlanSupported()}`;
        }
        constructor(){
            this.isIOS = [
                "iPad",
                "iPhone",
                "iPod"
            ].includes(navigator.platform), this.supportedBrowsers = [
                "firefox",
                "chrome",
                "safari"
            ], this.minFirefoxVersion = 59, this.minChromeVersion = 72, this.minSafariVersion = 605;
        }
    }, eD = (e)=>!e || /^[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*$/.test(e), ex = ()=>Math.random().toString(36).slice(2), eI = {
        iceServers: [
            {
                urls: "stun:stun.l.google.com:19302"
            },
            {
                urls: [
                    "turn:eu-0.turn.peerjs.com:3478",
                    "turn:us-0.turn.peerjs.com:3478"
                ],
                username: "peerjs",
                credential: "peerjsp"
            }
        ],
        sdpSemantics: "unified-plan"
    }, eM = new class extends n {
        noop() {}
        blobToArrayBuffer(e, t) {
            let n = new FileReader;
            return n.onload = function(e) {
                e.target && t(e.target.result);
            }, n.readAsArrayBuffer(e), n;
        }
        binaryStringToArrayBuffer(e) {
            let t = new Uint8Array(e.length);
            for(let n = 0; n < e.length; n++)t[n] = 255 & e.charCodeAt(n);
            return t.buffer;
        }
        isSecure() {
            return "https:" === location.protocol;
        }
        constructor(...e){
            super(...e), this.CLOUD_HOST = "0.peerjs.com", this.CLOUD_PORT = 443, this.chunkedBrowsers = {
                Chrome: 1,
                chrome: 1
            }, this.defaultConfig = eI, this.browser = eE.getBrowser(), this.browserVersion = eE.getVersion(), this.pack = o, this.unpack = i, this.supports = function() {
                let e;
                let t = {
                    browser: eE.isBrowserSupported(),
                    webRTC: eE.isWebRTCSupported(),
                    audioVideo: !1,
                    data: !1,
                    binaryBlob: !1,
                    reliable: !1
                };
                if (!t.webRTC) return t;
                try {
                    let n;
                    e = new RTCPeerConnection(eI), t.audioVideo = !0;
                    try {
                        n = e.createDataChannel("_PEERJSTEST", {
                            ordered: !0
                        }), t.data = !0, t.reliable = !!n.ordered;
                        try {
                            n.binaryType = "blob", t.binaryBlob = !eE.isIOS;
                        } catch (e) {}
                    } catch (e) {} finally{
                        n && n.close();
                    }
                } catch (e) {} finally{
                    e && e.close();
                }
                return t;
            }(), this.validateId = eD, this.randomToken = ex;
        }
    };
    (_ = w || (w = {}))[_.Disabled = 0] = "Disabled", _[_.Errors = 1] = "Errors", _[_.Warnings = 2] = "Warnings", _[_.All = 3] = "All";
    var eO = new class {
        get logLevel() {
            return this._logLevel;
        }
        set logLevel(e) {
            this._logLevel = e;
        }
        log(...e) {
            this._logLevel >= 3 && this._print(3, ...e);
        }
        warn(...e) {
            this._logLevel >= 2 && this._print(2, ...e);
        }
        error(...e) {
            this._logLevel >= 1 && this._print(1, ...e);
        }
        setLogFunction(e) {
            this._print = e;
        }
        _print(e, ...t) {
            let n = [
                "PeerJS: ",
                ...t
            ];
            for(let e in n)n[e] instanceof Error && (n[e] = "(" + n[e].name + ") " + n[e].message);
            e >= 3 ? console.log(...n) : e >= 2 ? console.warn("WARNING", ...n) : e >= 1 && console.error("ERROR", ...n);
        }
        constructor(){
            this._logLevel = 0;
        }
    }, ej = {}, eL = Object.prototype.hasOwnProperty, eA = "~";
    function eB() {}
    function eF(e, t, n) {
        this.fn = e, this.context = t, this.once = n || !1;
    }
    function eU(e, t, n, r, i) {
        if ("function" != typeof n) throw TypeError("The listener must be a function");
        var o = new eF(n, r || e, i), s = eA ? eA + t : t;
        return e._events[s] ? e._events[s].fn ? e._events[s] = [
            e._events[s],
            o
        ] : e._events[s].push(o) : (e._events[s] = o, e._eventsCount++), e;
    }
    function ez(e, t) {
        0 == --e._eventsCount ? e._events = new eB : delete e._events[t];
    }
    function eN() {
        this._events = new eB, this._eventsCount = 0;
    }
    Object.create && (eB.prototype = Object.create(null), new eB().__proto__ || (eA = !1)), eN.prototype.eventNames = function() {
        var e, t, n = [];
        if (0 === this._eventsCount) return n;
        for(t in e = this._events)eL.call(e, t) && n.push(eA ? t.slice(1) : t);
        return Object.getOwnPropertySymbols ? n.concat(Object.getOwnPropertySymbols(e)) : n;
    }, eN.prototype.listeners = function(e) {
        var t = eA ? eA + e : e, n = this._events[t];
        if (!n) return [];
        if (n.fn) return [
            n.fn
        ];
        for(var r = 0, i = n.length, o = Array(i); r < i; r++)o[r] = n[r].fn;
        return o;
    }, eN.prototype.listenerCount = function(e) {
        var t = eA ? eA + e : e, n = this._events[t];
        return n ? n.fn ? 1 : n.length : 0;
    }, eN.prototype.emit = function(e, t, n, r, i, o) {
        var s = eA ? eA + e : e;
        if (!this._events[s]) return !1;
        var a, c, l = this._events[s], p = arguments.length;
        if (l.fn) {
            switch(l.once && this.removeListener(e, l.fn, void 0, !0), p){
                case 1:
                    return l.fn.call(l.context), !0;
                case 2:
                    return l.fn.call(l.context, t), !0;
                case 3:
                    return l.fn.call(l.context, t, n), !0;
                case 4:
                    return l.fn.call(l.context, t, n, r), !0;
                case 5:
                    return l.fn.call(l.context, t, n, r, i), !0;
                case 6:
                    return l.fn.call(l.context, t, n, r, i, o), !0;
            }
            for(c = 1, a = Array(p - 1); c < p; c++)a[c - 1] = arguments[c];
            l.fn.apply(l.context, a);
        } else {
            var d, h = l.length;
            for(c = 0; c < h; c++)switch(l[c].once && this.removeListener(e, l[c].fn, void 0, !0), p){
                case 1:
                    l[c].fn.call(l[c].context);
                    break;
                case 2:
                    l[c].fn.call(l[c].context, t);
                    break;
                case 3:
                    l[c].fn.call(l[c].context, t, n);
                    break;
                case 4:
                    l[c].fn.call(l[c].context, t, n, r);
                    break;
                default:
                    if (!a) for(d = 1, a = Array(p - 1); d < p; d++)a[d - 1] = arguments[d];
                    l[c].fn.apply(l[c].context, a);
            }
        }
        return !0;
    }, eN.prototype.on = function(e, t, n) {
        return eU(this, e, t, n, !1);
    }, eN.prototype.once = function(e, t, n) {
        return eU(this, e, t, n, !0);
    }, eN.prototype.removeListener = function(e, t, n, r) {
        var i = eA ? eA + e : e;
        if (!this._events[i]) return this;
        if (!t) return ez(this, i), this;
        var o = this._events[i];
        if (o.fn) o.fn !== t || r && !o.once || n && o.context !== n || ez(this, i);
        else {
            for(var s = 0, a = [], c = o.length; s < c; s++)(o[s].fn !== t || r && !o[s].once || n && o[s].context !== n) && a.push(o[s]);
            a.length ? this._events[i] = 1 === a.length ? a[0] : a : ez(this, i);
        }
        return this;
    }, eN.prototype.removeAllListeners = function(e) {
        var t;
        return e ? (t = eA ? eA + e : e, this._events[t] && ez(this, t)) : (this._events = new eB, this._eventsCount = 0), this;
    }, eN.prototype.off = eN.prototype.removeListener, eN.prototype.addListener = eN.prototype.on, eN.prefixed = eA, eN.EventEmitter = eN, ej = eN, (C = P || (P = {})).Data = "data", C.Media = "media", (v = E || (E = {})).BrowserIncompatible = "browser-incompatible", v.Disconnected = "disconnected", v.InvalidID = "invalid-id", v.InvalidKey = "invalid-key", v.Network = "network", v.PeerUnavailable = "peer-unavailable", v.SslUnavailable = "ssl-unavailable", v.ServerError = "server-error", v.SocketError = "socket-error", v.SocketClosed = "socket-closed", v.UnavailableID = "unavailable-id", v.WebRTC = "webrtc", (b = D || (D = {})).NegotiationFailed = "negotiation-failed", b.ConnectionClosed = "connection-closed", (k = x || (x = {})).NotOpenYet = "not-open-yet", k.MessageToBig = "message-too-big", (S = I || (I = {})).Binary = "binary", S.BinaryUTF8 = "binary-utf8", S.JSON = "json", S.None = "raw", (T = M || (M = {})).Message = "message", T.Disconnected = "disconnected", T.Error = "error", T.Close = "close", (R = O || (O = {})).Heartbeat = "HEARTBEAT", R.Candidate = "CANDIDATE", R.Offer = "OFFER", R.Answer = "ANSWER", R.Open = "OPEN", R.Error = "ERROR", R.IdTaken = "ID-TAKEN", R.InvalidKey = "INVALID-KEY", R.Leave = "LEAVE", R.Expire = "EXPIRE";
    var e$ = {};
    e$ = JSON.parse('{"name":"peerjs","version":"1.5.2","keywords":["peerjs","webrtc","p2p","rtc"],"description":"PeerJS client","homepage":"https://peerjs.com","bugs":{"url":"https://github.com/peers/peerjs/issues"},"repository":{"type":"git","url":"https://github.com/peers/peerjs"},"license":"MIT","contributors":["Michelle Bu <michelle@michellebu.com>","afrokick <devbyru@gmail.com>","ericz <really.ez@gmail.com>","Jairo <kidandcat@gmail.com>","Jonas Gloning <34194370+jonasgloning@users.noreply.github.com>","Jairo Caro-Accino Viciana <jairo@galax.be>","Carlos Caballero <carlos.caballero.gonzalez@gmail.com>","hc <hheennrryy@gmail.com>","Muhammad Asif <capripio@gmail.com>","PrashoonB <prashoonbhattacharjee@gmail.com>","Harsh Bardhan Mishra <47351025+HarshCasper@users.noreply.github.com>","akotynski <aleksanderkotbury@gmail.com>","lmb <i@lmb.io>","Jairooo <jairocaro@msn.com>","Moritz St\xfcckler <moritz.stueckler@gmail.com>","Simon <crydotsnakegithub@gmail.com>","Denis Lukov <denismassters@gmail.com>","Philipp Hancke <fippo@andyet.net>","Hans Oksendahl <hansoksendahl@gmail.com>","Jess <jessachandler@gmail.com>","khankuan <khankuan@gmail.com>","DUODVK <kurmanov.work@gmail.com>","XiZhao <kwang1imsa@gmail.com>","Matthias Lohr <matthias@lohr.me>","=frank tree <=frnktrb@googlemail.com>","Andre Eckardt <aeckardt@outlook.com>","Chris Cowan <agentme49@gmail.com>","Alex Chuev <alex@chuev.com>","alxnull <alxnull@e.mail.de>","Yemel Jardi <angel.jardi@gmail.com>","Ben Parnell <benjaminparnell.94@gmail.com>","Benny Lichtner <bennlich@gmail.com>","fresheneesz <bitetrudpublic@gmail.com>","bob.barstead@exaptive.com <bob.barstead@exaptive.com>","chandika <chandika@gmail.com>","emersion <contact@emersion.fr>","Christopher Van <cvan@users.noreply.github.com>","eddieherm <edhermoso@gmail.com>","Eduardo Pinho <enet4mikeenet@gmail.com>","Evandro Zanatta <ezanatta@tray.net.br>","Gardner Bickford <gardner@users.noreply.github.com>","Gian Luca <gianluca.cecchi@cynny.com>","PatrickJS <github@gdi2290.com>","jonnyf <github@jonathanfoss.co.uk>","Hizkia Felix <hizkifw@gmail.com>","Hristo Oskov <hristo.oskov@gmail.com>","Isaac Madwed <i.madwed@gmail.com>","Ilya Konanykhin <ilya.konanykhin@gmail.com>","jasonbarry <jasbarry@me.com>","Jonathan Burke <jonathan.burke.1311@googlemail.com>","Josh Hamit <josh.hamit@gmail.com>","Jordan Austin <jrax86@gmail.com>","Joel Wetzell <jwetzell@yahoo.com>","xizhao <kevin.wang@cloudera.com>","Alberto Torres <kungfoobar@gmail.com>","Jonathan Mayol <mayoljonathan@gmail.com>","Jefferson Felix <me@jsfelix.dev>","Rolf Erik Lekang <me@rolflekang.com>","Kevin Mai-Husan Chia <mhchia@users.noreply.github.com>","Pepijn de Vos <pepijndevos@gmail.com>","JooYoung <qkdlql@naver.com>","Tobias Speicher <rootcommander@gmail.com>","Steve Blaurock <sblaurock@gmail.com>","Kyrylo Shegeda <shegeda@ualberta.ca>","Diwank Singh Tomer <singh@diwank.name>","So\u0308ren Balko <Soeren.Balko@gmail.com>","Arpit Solanki <solankiarpit1997@gmail.com>","Yuki Ito <yuki@gnnk.net>","Artur Zayats <zag2art@gmail.com>"],"funding":{"type":"opencollective","url":"https://opencollective.com/peer"},"collective":{"type":"opencollective","url":"https://opencollective.com/peer"},"files":["dist/*"],"sideEffects":["lib/global.ts","lib/supports.ts"],"main":"dist/bundler.cjs","module":"dist/bundler.mjs","browser-minified":"dist/peerjs.min.js","browser-unminified":"dist/peerjs.js","browser-minified-cbor":"dist/serializer.cbor.mjs","browser-minified-msgpack":"dist/serializer.msgpack.mjs","types":"dist/types.d.ts","engines":{"node":">= 14"},"targets":{"types":{"source":"lib/exports.ts"},"main":{"source":"lib/exports.ts","sourceMap":{"inlineSources":true}},"module":{"source":"lib/exports.ts","includeNodeModules":["eventemitter3"],"sourceMap":{"inlineSources":true}},"browser-minified":{"context":"browser","outputFormat":"global","optimize":true,"engines":{"browsers":"chrome >= 83, edge >= 83, firefox >= 80, safari >= 15"},"source":"lib/global.ts"},"browser-unminified":{"context":"browser","outputFormat":"global","optimize":false,"engines":{"browsers":"chrome >= 83, edge >= 83, firefox >= 80, safari >= 15"},"source":"lib/global.ts"},"browser-minified-cbor":{"context":"browser","outputFormat":"esmodule","isLibrary":true,"optimize":true,"engines":{"browsers":"chrome >= 83, edge >= 83, firefox >= 102, safari >= 15"},"source":"lib/dataconnection/StreamConnection/Cbor.ts"},"browser-minified-msgpack":{"context":"browser","outputFormat":"esmodule","isLibrary":true,"optimize":true,"engines":{"browsers":"chrome >= 83, edge >= 83, firefox >= 102, safari >= 15"},"source":"lib/dataconnection/StreamConnection/MsgPack.ts"}},"scripts":{"contributors":"git-authors-cli --print=false && prettier --write package.json && git add package.json package-lock.json && git commit -m \\"chore(contributors): update and sort contributors list\\"","check":"tsc --noEmit && tsc -p e2e/tsconfig.json --noEmit","watch":"parcel watch","build":"rm -rf dist && parcel build","prepublishOnly":"npm run build","test":"jest","test:watch":"jest --watch","coverage":"jest --coverage --collectCoverageFrom=\\"./lib/**\\"","format":"prettier --write .","format:check":"prettier --check .","semantic-release":"semantic-release","e2e":"wdio run e2e/wdio.local.conf.ts","e2e:bstack":"wdio run e2e/wdio.bstack.conf.ts"},"devDependencies":{"@parcel/config-default":"^2.9.3","@parcel/packager-ts":"^2.9.3","@parcel/transformer-typescript-tsc":"^2.9.3","@parcel/transformer-typescript-types":"^2.9.3","@semantic-release/changelog":"^6.0.1","@semantic-release/git":"^10.0.1","@swc/core":"^1.3.27","@swc/jest":"^0.2.24","@types/jasmine":"^4.3.4","@wdio/browserstack-service":"^8.11.2","@wdio/cli":"^8.11.2","@wdio/globals":"^8.11.2","@wdio/jasmine-framework":"^8.11.2","@wdio/local-runner":"^8.11.2","@wdio/spec-reporter":"^8.11.2","@wdio/types":"^8.10.4","http-server":"^14.1.1","jest":"^29.3.1","jest-environment-jsdom":"^29.3.1","mock-socket":"^9.0.0","parcel":"^2.9.3","prettier":"^3.0.0","semantic-release":"^21.0.0","ts-node":"^10.9.1","typescript":"^5.0.0","wdio-geckodriver-service":"^5.0.1"},"dependencies":{"@msgpack/msgpack":"^2.8.0","cbor-x":"1.5.4","eventemitter3":"^4.0.7","peerjs-js-binarypack":"^2.1.0","webrtc-adapter":"^8.0.0"},"alias":{"process":false,"buffer":false}}');
    class eJ extends ej.EventEmitter {
        start(e, t) {
            this._id = e;
            let n = `${this._baseUrl}&id=${e}&token=${t}`;
            !this._socket && this._disconnected && (this._socket = new WebSocket(n + "&version=" + e$.version), this._disconnected = !1, this._socket.onmessage = (e)=>{
                let t;
                try {
                    t = JSON.parse(e.data), eO.log("Server message received:", t);
                } catch (t) {
                    eO.log("Invalid server message", e.data);
                    return;
                }
                this.emit(M.Message, t);
            }, this._socket.onclose = (e)=>{
                this._disconnected || (eO.log("Socket closed.", e), this._cleanup(), this._disconnected = !0, this.emit(M.Disconnected));
            }, this._socket.onopen = ()=>{
                this._disconnected || (this._sendQueuedMessages(), eO.log("Socket open"), this._scheduleHeartbeat());
            });
        }
        _scheduleHeartbeat() {
            this._wsPingTimer = setTimeout(()=>{
                this._sendHeartbeat();
            }, this.pingInterval);
        }
        _sendHeartbeat() {
            if (!this._wsOpen()) {
                eO.log("Cannot send heartbeat, because socket closed");
                return;
            }
            let e = JSON.stringify({
                type: O.Heartbeat
            });
            this._socket.send(e), this._scheduleHeartbeat();
        }
        _wsOpen() {
            return !!this._socket && 1 === this._socket.readyState;
        }
        _sendQueuedMessages() {
            let e = [
                ...this._messagesQueue
            ];
            for (let t of (this._messagesQueue = [], e))this.send(t);
        }
        send(e) {
            if (this._disconnected) return;
            if (!this._id) {
                this._messagesQueue.push(e);
                return;
            }
            if (!e.type) {
                this.emit(M.Error, "Invalid message");
                return;
            }
            if (!this._wsOpen()) return;
            let t = JSON.stringify(e);
            this._socket.send(t);
        }
        close() {
            this._disconnected || (this._cleanup(), this._disconnected = !0);
        }
        _cleanup() {
            this._socket && (this._socket.onopen = this._socket.onmessage = this._socket.onclose = null, this._socket.close(), this._socket = void 0), clearTimeout(this._wsPingTimer);
        }
        constructor(e, t, n, r, i, o = 5e3){
            super(), this.pingInterval = o, this._disconnected = !0, this._messagesQueue = [], this._baseUrl = (e ? "wss://" : "ws://") + t + ":" + n + r + "peerjs?key=" + i;
        }
    }
    class eV {
        startConnection(e) {
            let t = this._startPeerConnection();
            if (this.connection.peerConnection = t, this.connection.type === P.Media && e._stream && this._addTracksToConnection(e._stream, t), e.originator) {
                let n = this.connection, r = {
                    ordered: !!e.reliable
                }, i = t.createDataChannel(n.label, r);
                n._initializeDataChannel(i), this._makeOffer();
            } else this.handleSDP("OFFER", e.sdp);
        }
        _startPeerConnection() {
            eO.log("Creating RTCPeerConnection.");
            let e = new RTCPeerConnection(this.connection.provider.options.config);
            return this._setupListeners(e), e;
        }
        _setupListeners(e) {
            let t = this.connection.peer, n = this.connection.connectionId, r = this.connection.type, i = this.connection.provider;
            eO.log("Listening for ICE candidates."), e.onicecandidate = (e)=>{
                e.candidate && e.candidate.candidate && (eO.log(`Received ICE candidates for ${t}:`, e.candidate), i.socket.send({
                    type: O.Candidate,
                    payload: {
                        candidate: e.candidate,
                        type: r,
                        connectionId: n
                    },
                    dst: t
                }));
            }, e.oniceconnectionstatechange = ()=>{
                switch(e.iceConnectionState){
                    case "failed":
                        eO.log("iceConnectionState is failed, closing connections to " + t), this.connection.emitError(D.NegotiationFailed, "Negotiation of connection to " + t + " failed."), this.connection.close();
                        break;
                    case "closed":
                        eO.log("iceConnectionState is closed, closing connections to " + t), this.connection.emitError(D.ConnectionClosed, "Connection to " + t + " closed."), this.connection.close();
                        break;
                    case "disconnected":
                        eO.log("iceConnectionState changed to disconnected on the connection with " + t);
                        break;
                    case "completed":
                        e.onicecandidate = ()=>{};
                }
                this.connection.emit("iceStateChanged", e.iceConnectionState);
            }, eO.log("Listening for data channel"), e.ondatachannel = (e)=>{
                eO.log("Received data channel");
                let r = e.channel;
                i.getConnection(t, n)._initializeDataChannel(r);
            }, eO.log("Listening for remote stream"), e.ontrack = (e)=>{
                eO.log("Received remote stream");
                let r = e.streams[0], o = i.getConnection(t, n);
                o.type === P.Media && this._addStreamToMediaConnection(r, o);
            };
        }
        cleanup() {
            eO.log("Cleaning up PeerConnection to " + this.connection.peer);
            let e = this.connection.peerConnection;
            if (!e) return;
            this.connection.peerConnection = null, e.onicecandidate = e.oniceconnectionstatechange = e.ondatachannel = e.ontrack = ()=>{};
            let t = "closed" !== e.signalingState, n = !1, r = this.connection.dataChannel;
            r && (n = !!r.readyState && "closed" !== r.readyState), (t || n) && e.close();
        }
        async _makeOffer() {
            let e = this.connection.peerConnection, t = this.connection.provider;
            try {
                let n = await e.createOffer(this.connection.options.constraints);
                eO.log("Created offer."), this.connection.options.sdpTransform && "function" == typeof this.connection.options.sdpTransform && (n.sdp = this.connection.options.sdpTransform(n.sdp) || n.sdp);
                try {
                    await e.setLocalDescription(n), eO.log("Set localDescription:", n, `for:${this.connection.peer}`);
                    let r = {
                        sdp: n,
                        type: this.connection.type,
                        connectionId: this.connection.connectionId,
                        metadata: this.connection.metadata
                    };
                    if (this.connection.type === P.Data) {
                        let e = this.connection;
                        r = {
                            ...r,
                            label: e.label,
                            reliable: e.reliable,
                            serialization: e.serialization
                        };
                    }
                    t.socket.send({
                        type: O.Offer,
                        payload: r,
                        dst: this.connection.peer
                    });
                } catch (e) {
                    "OperationError: Failed to set local offer sdp: Called in wrong state: kHaveRemoteOffer" != e && (t.emitError(E.WebRTC, e), eO.log("Failed to setLocalDescription, ", e));
                }
            } catch (e) {
                t.emitError(E.WebRTC, e), eO.log("Failed to createOffer, ", e);
            }
        }
        async _makeAnswer() {
            let e = this.connection.peerConnection, t = this.connection.provider;
            try {
                let n = await e.createAnswer();
                eO.log("Created answer."), this.connection.options.sdpTransform && "function" == typeof this.connection.options.sdpTransform && (n.sdp = this.connection.options.sdpTransform(n.sdp) || n.sdp);
                try {
                    await e.setLocalDescription(n), eO.log("Set localDescription:", n, `for:${this.connection.peer}`), t.socket.send({
                        type: O.Answer,
                        payload: {
                            sdp: n,
                            type: this.connection.type,
                            connectionId: this.connection.connectionId
                        },
                        dst: this.connection.peer
                    });
                } catch (e) {
                    t.emitError(E.WebRTC, e), eO.log("Failed to setLocalDescription, ", e);
                }
            } catch (e) {
                t.emitError(E.WebRTC, e), eO.log("Failed to create answer, ", e);
            }
        }
        async handleSDP(e, t) {
            t = new RTCSessionDescription(t);
            let n = this.connection.peerConnection, r = this.connection.provider;
            eO.log("Setting remote description", t);
            try {
                await n.setRemoteDescription(t), eO.log(`Set remoteDescription:${e} for:${this.connection.peer}`), "OFFER" === e && await this._makeAnswer();
            } catch (e) {
                r.emitError(E.WebRTC, e), eO.log("Failed to setRemoteDescription, ", e);
            }
        }
        async handleCandidate(e) {
            eO.log("handleCandidate:", e);
            try {
                await this.connection.peerConnection.addIceCandidate(e), eO.log(`Added ICE candidate for:${this.connection.peer}`);
            } catch (e) {
                this.connection.provider.emitError(E.WebRTC, e), eO.log("Failed to handleCandidate, ", e);
            }
        }
        _addTracksToConnection(e, t) {
            if (eO.log(`add tracks from stream ${e.id} to peer connection`), !t.addTrack) return eO.error("Your browser does't support RTCPeerConnection#addTrack. Ignored.");
            e.getTracks().forEach((n)=>{
                t.addTrack(n, e);
            });
        }
        _addStreamToMediaConnection(e, t) {
            eO.log(`add stream ${e.id} to media connection ${t.connectionId}`), t.addStream(e);
        }
        constructor(e){
            this.connection = e;
        }
    }
    class eG extends ej.EventEmitter {
        emitError(e, t) {
            eO.error("Error:", t), this.emit("error", new eW(`${e}`, t));
        }
    }
    class eW extends Error {
        constructor(e, t){
            "string" == typeof t ? super(t) : (super(), Object.assign(this, t)), this.type = e;
        }
    }
    class eH extends eG {
        get open() {
            return this._open;
        }
        constructor(e, t, n){
            super(), this.peer = e, this.provider = t, this.options = n, this._open = !1, this.metadata = n.metadata;
        }
    }
    class eY extends eH {
        get type() {
            return P.Media;
        }
        get localStream() {
            return this._localStream;
        }
        get remoteStream() {
            return this._remoteStream;
        }
        _initializeDataChannel(e) {
            this.dataChannel = e, this.dataChannel.onopen = ()=>{
                eO.log(`DC#${this.connectionId} dc connection success`), this.emit("willCloseOnRemote");
            }, this.dataChannel.onclose = ()=>{
                eO.log(`DC#${this.connectionId} dc closed for:`, this.peer), this.close();
            };
        }
        addStream(e) {
            eO.log("Receiving stream", e), this._remoteStream = e, super.emit("stream", e);
        }
        handleMessage(e) {
            let t = e.type, n = e.payload;
            switch(e.type){
                case O.Answer:
                    this._negotiator.handleSDP(t, n.sdp), this._open = !0;
                    break;
                case O.Candidate:
                    this._negotiator.handleCandidate(n.candidate);
                    break;
                default:
                    eO.warn(`Unrecognized message type:${t} from peer:${this.peer}`);
            }
        }
        answer(e, t = {}) {
            if (this._localStream) {
                eO.warn("Local stream already exists on this MediaConnection. Are you answering a call twice?");
                return;
            }
            for (let n of (this._localStream = e, t && t.sdpTransform && (this.options.sdpTransform = t.sdpTransform), this._negotiator.startConnection({
                ...this.options._payload,
                _stream: e
            }), this.provider._getMessages(this.connectionId)))this.handleMessage(n);
            this._open = !0;
        }
        close() {
            this._negotiator && (this._negotiator.cleanup(), this._negotiator = null), this._localStream = null, this._remoteStream = null, this.provider && (this.provider._removeConnection(this), this.provider = null), this.options && this.options._stream && (this.options._stream = null), this.open && (this._open = !1, super.emit("close"));
        }
        constructor(e, t, n){
            super(e, t, n), this._localStream = this.options._stream, this.connectionId = this.options.connectionId || eY.ID_PREFIX + eM.randomToken(), this._negotiator = new eV(this), this._localStream && this._negotiator.startConnection({
                _stream: this._localStream,
                originator: !0
            });
        }
    }
    eY.ID_PREFIX = "mc_";
    class eK {
        _buildRequest(e) {
            let t = this._options.secure ? "https" : "http", { host: n, port: r, path: i, key: o } = this._options, s = new URL(`${t}://${n}:${r}${i}${o}/${e}`);
            return s.searchParams.set("ts", `${Date.now()}${Math.random()}`), s.searchParams.set("version", e$.version), fetch(s.href, {
                referrerPolicy: this._options.referrerPolicy
            });
        }
        async retrieveId() {
            try {
                let e = await this._buildRequest("id");
                if (200 !== e.status) throw Error(`Error. Status:${e.status}`);
                return e.text();
            } catch (t) {
                eO.error("Error retrieving ID", t);
                let e = "";
                throw "/" === this._options.path && this._options.host !== eM.CLOUD_HOST && (e = " If you passed in a `path` to your self-hosted PeerServer, you'll also need to pass in that same path when creating a new Peer."), Error("Could not get an ID from the server." + e);
            }
        }
        async listAllPeers() {
            try {
                let e = await this._buildRequest("peers");
                if (200 !== e.status) {
                    if (401 === e.status) {
                        let e = "";
                        throw e = this._options.host === eM.CLOUD_HOST ? "It looks like you're using the cloud server. You can email team@peerjs.com to enable peer listing for your API key." : "You need to enable `allow_discovery` on your self-hosted PeerServer to use this feature.", Error("It doesn't look like you have permission to list peers IDs. " + e);
                    }
                    throw Error(`Error. Status:${e.status}`);
                }
                return e.json();
            } catch (e) {
                throw eO.error("Error retrieving list peers", e), Error("Could not get list peers from the server." + e);
            }
        }
        constructor(e){
            this._options = e;
        }
    }
    class eX extends eH {
        get type() {
            return P.Data;
        }
        _initializeDataChannel(e) {
            this.dataChannel = e, this.dataChannel.onopen = ()=>{
                eO.log(`DC#${this.connectionId} dc connection success`), this._open = !0, this.emit("open");
            }, this.dataChannel.onmessage = (e)=>{
                eO.log(`DC#${this.connectionId} dc onmessage:`, e.data);
            }, this.dataChannel.onclose = ()=>{
                eO.log(`DC#${this.connectionId} dc closed for:`, this.peer), this.close();
            };
        }
        close(e) {
            if (e?.flush) {
                this.send({
                    __peerData: {
                        type: "close"
                    }
                });
                return;
            }
            this._negotiator && (this._negotiator.cleanup(), this._negotiator = null), this.provider && (this.provider._removeConnection(this), this.provider = null), this.dataChannel && (this.dataChannel.onopen = null, this.dataChannel.onmessage = null, this.dataChannel.onclose = null, this.dataChannel = null), this.open && (this._open = !1, super.emit("close"));
        }
        send(e, t = !1) {
            if (!this.open) {
                this.emitError(x.NotOpenYet, "Connection is not open. You should listen for the `open` event before sending messages.");
                return;
            }
            return this._send(e, t);
        }
        async handleMessage(e) {
            let t = e.payload;
            switch(e.type){
                case O.Answer:
                    await this._negotiator.handleSDP(e.type, t.sdp);
                    break;
                case O.Candidate:
                    await this._negotiator.handleCandidate(t.candidate);
                    break;
                default:
                    eO.warn("Unrecognized message type:", e.type, "from peer:", this.peer);
            }
        }
        constructor(e, t, n){
            super(e, t, n), this.connectionId = this.options.connectionId || eX.ID_PREFIX + ex(), this.label = this.options.label || this.connectionId, this.reliable = !!this.options.reliable, this._negotiator = new eV(this), this._negotiator.startConnection(this.options._payload || {
                originator: !0,
                reliable: this.reliable
            });
        }
    }
    eX.ID_PREFIX = "dc_", eX.MAX_BUFFERED_AMOUNT = 8388608;
    class eq extends eX {
        get bufferSize() {
            return this._bufferSize;
        }
        _initializeDataChannel(e) {
            super._initializeDataChannel(e), this.dataChannel.binaryType = "arraybuffer", this.dataChannel.addEventListener("message", (e)=>this._handleDataMessage(e));
        }
        _bufferedSend(e) {
            (this._buffering || !this._trySend(e)) && (this._buffer.push(e), this._bufferSize = this._buffer.length);
        }
        _trySend(e) {
            if (!this.open) return !1;
            if (this.dataChannel.bufferedAmount > eX.MAX_BUFFERED_AMOUNT) return this._buffering = !0, setTimeout(()=>{
                this._buffering = !1, this._tryBuffer();
            }, 50), !1;
            try {
                this.dataChannel.send(e);
            } catch (e) {
                return eO.error(`DC#:${this.connectionId} Error when sending:`, e), this._buffering = !0, this.close(), !1;
            }
            return !0;
        }
        _tryBuffer() {
            if (!this.open || 0 === this._buffer.length) return;
            let e = this._buffer[0];
            this._trySend(e) && (this._buffer.shift(), this._bufferSize = this._buffer.length, this._tryBuffer());
        }
        close(e) {
            if (e?.flush) {
                this.send({
                    __peerData: {
                        type: "close"
                    }
                });
                return;
            }
            this._buffer = [], this._bufferSize = 0, super.close();
        }
        constructor(...e){
            super(...e), this._buffer = [], this._bufferSize = 0, this._buffering = !1;
        }
    }
    class eQ extends eq {
        close(e) {
            super.close(e), this._chunkedData = {};
        }
        _handleDataMessage({ data: e }) {
            let t = i(e), n = t.__peerData;
            if (n) {
                if ("close" === n.type) {
                    this.close();
                    return;
                }
                this._handleChunk(t);
                return;
            }
            this.emit("data", t);
        }
        _handleChunk(e) {
            let t = e.__peerData, n = this._chunkedData[t] || {
                data: [],
                count: 0,
                total: e.total
            };
            if (n.data[e.n] = new Uint8Array(e.data), n.count++, this._chunkedData[t] = n, n.total === n.count) {
                delete this._chunkedData[t];
                let e = function(e) {
                    let t = 0;
                    for (let n of e)t += n.byteLength;
                    let n = new Uint8Array(t), r = 0;
                    for (let t of e)n.set(t, r), r += t.byteLength;
                    return n;
                }(n.data);
                this._handleDataMessage({
                    data: e
                });
            }
        }
        _send(e, t) {
            let n = o(e);
            if (n instanceof Promise) return this._send_blob(n);
            if (!t && n.byteLength > this.chunker.chunkedMTU) {
                this._sendChunks(n);
                return;
            }
            this._bufferedSend(n);
        }
        async _send_blob(e) {
            let t = await e;
            if (t.byteLength > this.chunker.chunkedMTU) {
                this._sendChunks(t);
                return;
            }
            this._bufferedSend(t);
        }
        _sendChunks(e) {
            let t = this.chunker.chunk(e);
            for (let e of (eO.log(`DC#${this.connectionId} Try to send ${t.length} chunks...`), t))this.send(e, !0);
        }
        constructor(e, t, r){
            super(e, t, r), this.chunker = new n, this.serialization = I.Binary, this._chunkedData = {};
        }
    }
    class eZ extends eq {
        _handleDataMessage({ data: e }) {
            super.emit("data", e);
        }
        _send(e, t) {
            this._bufferedSend(e);
        }
        constructor(...e){
            super(...e), this.serialization = I.None;
        }
    }
    class e0 extends eq {
        _handleDataMessage({ data: e }) {
            let t = this.parse(this.decoder.decode(e)), n = t.__peerData;
            if (n && "close" === n.type) {
                this.close();
                return;
            }
            this.emit("data", t);
        }
        _send(e, t) {
            let n = this.encoder.encode(this.stringify(e));
            if (n.byteLength >= eM.chunkedMTU) {
                this.emitError(x.MessageToBig, "Message too big for JSON channel");
                return;
            }
            this._bufferedSend(n);
        }
        constructor(...e){
            super(...e), this.serialization = I.JSON, this.encoder = new TextEncoder, this.decoder = new TextDecoder, this.stringify = JSON.stringify, this.parse = JSON.parse;
        }
    }
    class e1 extends eG {
        get id() {
            return this._id;
        }
        get options() {
            return this._options;
        }
        get open() {
            return this._open;
        }
        get socket() {
            return this._socket;
        }
        get connections() {
            let e = Object.create(null);
            for (let [t, n] of this._connections)e[t] = n;
            return e;
        }
        get destroyed() {
            return this._destroyed;
        }
        get disconnected() {
            return this._disconnected;
        }
        _createServerConnection() {
            let e = new eJ(this._options.secure, this._options.host, this._options.port, this._options.path, this._options.key, this._options.pingInterval);
            return e.on(M.Message, (e)=>{
                this._handleMessage(e);
            }), e.on(M.Error, (e)=>{
                this._abort(E.SocketError, e);
            }), e.on(M.Disconnected, ()=>{
                this.disconnected || (this.emitError(E.Network, "Lost connection to server."), this.disconnect());
            }), e.on(M.Close, ()=>{
                this.disconnected || this._abort(E.SocketClosed, "Underlying socket is already closed.");
            }), e;
        }
        _initialize(e) {
            this._id = e, this.socket.start(e, this._options.token);
        }
        _handleMessage(e) {
            let t = e.type, n = e.payload, r = e.src;
            switch(t){
                case O.Open:
                    this._lastServerId = this.id, this._open = !0, this.emit("open", this.id);
                    break;
                case O.Error:
                    this._abort(E.ServerError, n.msg);
                    break;
                case O.IdTaken:
                    this._abort(E.UnavailableID, `ID "${this.id}" is taken`);
                    break;
                case O.InvalidKey:
                    this._abort(E.InvalidKey, `API KEY "${this._options.key}" is invalid`);
                    break;
                case O.Leave:
                    eO.log(`Received leave message from ${r}`), this._cleanupPeer(r), this._connections.delete(r);
                    break;
                case O.Expire:
                    this.emitError(E.PeerUnavailable, `Could not connect to peer ${r}`);
                    break;
                case O.Offer:
                    {
                        let e = n.connectionId, t = this.getConnection(r, e);
                        if (t && (t.close(), eO.warn(`Offer received for existing Connection ID:${e}`)), n.type === P.Media) {
                            let i = new eY(r, this, {
                                connectionId: e,
                                _payload: n,
                                metadata: n.metadata
                            });
                            t = i, this._addConnection(r, t), this.emit("call", i);
                        } else if (n.type === P.Data) {
                            let i = new this._serializers[n.serialization](r, this, {
                                connectionId: e,
                                _payload: n,
                                metadata: n.metadata,
                                label: n.label,
                                serialization: n.serialization,
                                reliable: n.reliable
                            });
                            t = i, this._addConnection(r, t), this.emit("connection", i);
                        } else {
                            eO.warn(`Received malformed connection type:${n.type}`);
                            return;
                        }
                        for (let n of this._getMessages(e))t.handleMessage(n);
                        break;
                    }
                default:
                    {
                        if (!n) {
                            eO.warn(`You received a malformed message from ${r} of type ${t}`);
                            return;
                        }
                        let i = n.connectionId, o = this.getConnection(r, i);
                        o && o.peerConnection ? o.handleMessage(e) : i ? this._storeMessage(i, e) : eO.warn("You received an unrecognized message:", e);
                    }
            }
        }
        _storeMessage(e, t) {
            this._lostMessages.has(e) || this._lostMessages.set(e, []), this._lostMessages.get(e).push(t);
        }
        _getMessages(e) {
            let t = this._lostMessages.get(e);
            return t ? (this._lostMessages.delete(e), t) : [];
        }
        connect(e, t = {}) {
            if (t = {
                serialization: "default",
                ...t
            }, this.disconnected) {
                eO.warn("You cannot connect to a new Peer because you called .disconnect() on this Peer and ended your connection with the server. You can create a new Peer to reconnect, or call reconnect on this peer if you believe its ID to still be available."), this.emitError(E.Disconnected, "Cannot connect to new Peer after disconnecting from server.");
                return;
            }
            let n = new this._serializers[t.serialization](e, this, t);
            return this._addConnection(e, n), n;
        }
        call(e, t, n = {}) {
            if (this.disconnected) {
                eO.warn("You cannot connect to a new Peer because you called .disconnect() on this Peer and ended your connection with the server. You can create a new Peer to reconnect."), this.emitError(E.Disconnected, "Cannot connect to new Peer after disconnecting from server.");
                return;
            }
            if (!t) {
                eO.error("To call a peer, you must provide a stream from your browser's `getUserMedia`.");
                return;
            }
            let r = new eY(e, this, {
                ...n,
                _stream: t
            });
            return this._addConnection(e, r), r;
        }
        _addConnection(e, t) {
            eO.log(`add connection ${t.type}:${t.connectionId} to peerId:${e}`), this._connections.has(e) || this._connections.set(e, []), this._connections.get(e).push(t);
        }
        _removeConnection(e) {
            let t = this._connections.get(e.peer);
            if (t) {
                let n = t.indexOf(e);
                -1 !== n && t.splice(n, 1);
            }
            this._lostMessages.delete(e.connectionId);
        }
        getConnection(e, t) {
            let n = this._connections.get(e);
            if (!n) return null;
            for (let e of n)if (e.connectionId === t) return e;
            return null;
        }
        _delayedAbort(e, t) {
            setTimeout(()=>{
                this._abort(e, t);
            }, 0);
        }
        _abort(e, t) {
            eO.error("Aborting!"), this.emitError(e, t), this._lastServerId ? this.disconnect() : this.destroy();
        }
        destroy() {
            this.destroyed || (eO.log(`Destroy peer with ID:${this.id}`), this.disconnect(), this._cleanup(), this._destroyed = !0, this.emit("close"));
        }
        _cleanup() {
            for (let e of this._connections.keys())this._cleanupPeer(e), this._connections.delete(e);
            this.socket.removeAllListeners();
        }
        _cleanupPeer(e) {
            let t = this._connections.get(e);
            if (t) for (let e of t)e.close();
        }
        disconnect() {
            if (this.disconnected) return;
            let e = this.id;
            eO.log(`Disconnect peer with ID:${e}`), this._disconnected = !0, this._open = !1, this.socket.close(), this._lastServerId = e, this._id = null, this.emit("disconnected", e);
        }
        reconnect() {
            if (this.disconnected && !this.destroyed) eO.log(`Attempting reconnection to server with ID ${this._lastServerId}`), this._disconnected = !1, this._initialize(this._lastServerId);
            else if (this.destroyed) throw Error("This peer cannot reconnect to the server. It has already been destroyed.");
            else if (this.disconnected || this.open) throw Error(`Peer ${this.id} cannot reconnect because it is not disconnected from the server!`);
            else eO.error("In a hurry? We're still trying to make the initial connection!");
        }
        listAllPeers(e = (e)=>{}) {
            this._api.listAllPeers().then((t)=>e(t)).catch((e)=>this._abort(E.ServerError, e));
        }
        constructor(e, t){
            let n;
            if (super(), this._serializers = {
                raw: eZ,
                json: e0,
                binary: eQ,
                "binary-utf8": eQ,
                default: eQ
            }, this._id = null, this._lastServerId = null, this._destroyed = !1, this._disconnected = !1, this._open = !1, this._connections = new Map, this._lostMessages = new Map, e && e.constructor == Object ? t = e : e && (n = e.toString()), t = {
                debug: 0,
                host: eM.CLOUD_HOST,
                port: eM.CLOUD_PORT,
                path: "/",
                key: e1.DEFAULT_KEY,
                token: eM.randomToken(),
                config: eM.defaultConfig,
                referrerPolicy: "strict-origin-when-cross-origin",
                serializers: {},
                ...t
            }, this._options = t, this._serializers = {
                ...this._serializers,
                ...this.options.serializers
            }, "/" === this._options.host && (this._options.host = window.location.hostname), this._options.path && ("/" !== this._options.path[0] && (this._options.path = "/" + this._options.path), "/" !== this._options.path[this._options.path.length - 1] && (this._options.path += "/")), void 0 === this._options.secure && this._options.host !== eM.CLOUD_HOST ? this._options.secure = eM.isSecure() : this._options.host == eM.CLOUD_HOST && (this._options.secure = !0), this._options.logFunction && eO.setLogFunction(this._options.logFunction), eO.logLevel = this._options.debug || 0, this._api = new eK(t), this._socket = this._createServerConnection(), !eM.supports.audioVideo && !eM.supports.data) {
                this._delayedAbort(E.BrowserIncompatible, "The current browser does not support WebRTC");
                return;
            }
            if (n && !eM.validateId(n)) {
                this._delayedAbort(E.InvalidID, `ID "${n}" is invalid`);
                return;
            }
            n ? this._initialize(n) : this._api.retrieveId().then((e)=>this._initialize(e)).catch((e)=>this._abort(E.ServerError, e));
        }
    }
    e1.DEFAULT_KEY = "peerjs", window.peerjs = {
        Peer: e1,
        util: eM
    }, window.Peer = e1;
})(); //# sourceMappingURL=peerjs.min.js.map

