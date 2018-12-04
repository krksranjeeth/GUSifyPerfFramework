(function () {

    var JSON_VIEWER     = document.getElementById('jsonViewer');
    var TIMELINE_IFRAME = document.getElementById('timeline-iframe');

    var PERF_HOST    = 'http://localhost:5000';

    var PERF_API     = '/performance/1';
    var PERF_VERSION = 1;

    var TEMPLATE_LI = [
        '<li>',
            '<p class="date"><a href="#"><b>{value}</b>{unit}</a></p>',
            '<h3>{name}</h3>',
            '<p>{desc}</p>',
        '</li>'
    ].join('');


    jsforce.browser.init({
        clientId: '3MVG9szVa2RxsqBbtrAFxNV7DtetjiAGkcK53QMdlhmR4rSzUriF3Oj2YA8yZbHjVFl2wa8pzTN7eKYOQtM3t',
        redirectUri: 'https://' + window.location.host +'/'
    });

    var PERF_DESC = {
        'aura.coql.afterrender.added': {
            unit: '',
            desc: 'Number of afterRneder calls'
        }
    };

    var PERFAPP = {
        initialize: function () {
            var config = this.getConfig();
            if (config.testId) {
                this.getTestMetrics();
                this.getTransaction();
                this.getTimeline();
            } else {
                // TODO: default behaviour?
            }
            this.initializeGus();
        },
        initializeGus: function () {
            var self = this;
            var setUserAttributes = function(accessToken){
                $.get( "/gus/userInfo/"+accessToken, function( data ) {
                    var userPic = $("#userPic");
                    userPic.attr("src", data.photos.thumbnail);
                    userPic.attr("alt", data.display_name);
                    $("#userName").html('Welcome, '+data.display_name);
                });
            };
            jsforce.browser.on('connect', function(conn) {
                setUserAttributes(conn.accessToken);
            });
            if(jsforce.browser.isLoggedIn()){
                setUserAttributes(jsforce.browser.connection.accessToken);
            }
        },
        getConfig: function () {
            var config = {};
            var globalConfig = window.PERFCONFIG || {};
            var urlConfig = this._queryStringToJson(window.location.hash);
            var i;

            for (i in globalConfig) {
                if (globalConfig.hasOwnProperty(i)) {
                    config[i] = globalConfig[i];
                }
            }

            for (i in urlConfig) {
                if (urlConfig.hasOwnProperty(i)) {
                    config[i] = urlConfig[i];
                }
            }

            this.config = config;
            return config;
        },
        getTestMetrics: function () {
            if (!this.config.serverRender) {
                var testId = this.config.testId;
                this._sendRequest(PERF_API + '/test/id/' + testId + '/metrics', function (errorTestMetrics, metrics) {
                    if (!errorTestMetrics) {
                        this.updateMetrics(metrics);
                    } else {
                    //TODO: ERROR
                    }
                });
            }

        },
        updateMetrics: function (metrics) {
            var container = document.createElement('div');
            var html = metrics.map(function (metric) {
                var key = metric.name.toLowerCase();

                return TEMPLATE_LI
                    .replace('{value}', metric.value)
                    .replace('{name}', metric.name)
                    .replace('{unit}', metric.unit || '')
                    .replace('{desc}', PERF_DESC[key] && PERF_DESC[key].desc || '');
            });

            document.querySelector('#metrics-list').innerHTML = html.join('');
        },
        getTransaction: function () {
            if (this.config.serverRender && this.config.transaction) {
                this.updateTransaction(this.config.transaction);
            } else {
                var testId = this.config.testId;
                this._sendRequest(PERF_API + '/test/id/' + testId + '/transaction', function (errorTX, transaction) {
                    if (!errorTX) {
                        this.updateTransaction(transaction);
                    } else {
                        //TODO: ERROR
                    }
                });
            }
        },
        updateTransaction: function (tr) {
            if (!this._prettyJSON) {
                this._prettyJSON = new PrettyJSON.view.Node({
                    el: JSON_VIEWER,
                    data:tr
                });
                this._prettyJSON.expandAll();
            }
        },
        getTimeline: function () {
            var testId = this.config.testId;
            if (testId && TIMELINE_IFRAME) {
                var node = TIMELINE_IFRAME;
                var src = node.dataset.src;
                var loadParam = node.dataset.lp;
                var timelineTestApiUrl = [location.origin, PERF_API, '/test/id/', testId, '/timeline'].join('');
                var frameUrl = src + '?' + loadParam + '='  + timelineTestApiUrl;

                // Set final url to the iframes
                node.src = frameUrl;
            }
        },

        _queryStringToJson: function (queryString) {
            var match,
                pl     = /\+/g,  // Regex for replacing addition symbol with a space
                search = /([^&=]+)=?([^&]*)/g,
                decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
                query  = queryString || window.location.search.substring(1),
                urlParams = {};

            while (match = search.exec(query)) {
               urlParams[decode(match[1])] = decode(match[2]);
            }

            return urlParams;
        },
        _sendRequest: function (url, callback) {
            var self = this;
            var xhr  = new XMLHttpRequest();
            xhr.open('GET', PERF_HOST + url, true);
            xhr.onreadystatechange = function(e) {
                if (this.readyState == 4 && this.status == 200) {
                    callback.call(self, null, JSON.parse(this.responseText));
                } else {
                    callback.call(self, {status: this.statusText});
                }
            };
            xhr.send();
        }
    };

    window.PERFAPP = PERFAPP;

    window.addEventListener('load', function () {
        PERFAPP.initialize();
    });
}());
