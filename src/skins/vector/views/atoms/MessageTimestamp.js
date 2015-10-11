/*
Copyright 2015 OpenMarket Ltd

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

'use strict';

var React = require('react');

var MessageTimestampController = require('matrix-react-sdk/lib/controllers/atoms/MessageTimestamp')

module.exports = React.createClass({
    displayName: 'MessageTimestamp',
    mixins: [MessageTimestampController],

    formatDate: function(date) {
        // date.toLocaleTimeString is completely system dependent.
        // just go 24h for now
        function pad(n) {
            return (n < 10 ? '0' : '') + n;
        }
        return pad(date.getHours()) + ':' + pad(date.getMinutes());
    },

    render: function() {
        var date = new Date(this.props.ts);
        return (
            <span className="mx_MessageTimestamp">
                { this.formatDate(date) }
            </span>
        );
    },
});

