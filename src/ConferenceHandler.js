"use strict";
var q = require("q");
var Matrix = require("matrix-js-sdk");
var Room = Matrix.Room;

var USER_PREFIX = "fs_";
var DOMAIN = "matrix.org";

function ConferenceCall(matrixClient, groupChatRoomId) {
    this.client = matrixClient;
    this.groupRoomId = groupChatRoomId;
    // abuse browserify's core node Buffer support (strip padding ='s)
    var base64RoomId = new Buffer(groupChatRoomId).toString("base64").replace(/=/g, "");
    this.confUserId = "@" + USER_PREFIX + base64RoomId + ":" + DOMAIN;
}

ConferenceCall.prototype.setup = function() {
    var self = this;
    return this._joinConferenceUser().then(function() {
        return self._getConferenceUserRoom();
    }).then(function(room) {
        // return a call for *this* room to be placed.
        return Matrix.createNewMatrixCall(self.client, room.roomId);
    });
};

ConferenceCall.prototype._joinConferenceUser = function() {
    // Make sure the conference user is in the group chat room
    var groupRoom = this.client.getRoom(this.groupRoomId);
    if (!groupRoom) {
        return q.reject("Bad group room ID");
    }
    var member = groupRoom.getMember(this.confUserId);
    if (member && member.membership === "join") {
        return q();
    }
    return this.client.invite(this.groupRoomId, this.confUserId);
};

ConferenceCall.prototype._getConferenceUserRoom = function() {
    // Use an existing 1:1 with the conference user; else make one
    var rooms = this.client.getRooms();
    var confRoom = null;
    for (var i = 0; i < rooms.length; i++) {
        var confUser = rooms[i].getMember(this.confUserId);
        if (confUser && confUser.membership === "join" &&
                rooms[i].getJoinedMembers().length === 2) {
            confRoom = rooms[i];
            break;
        }
    }
    if (confRoom) {
        return q(confRoom);
    }
    return this.client.createRoom({
        preset: "private_chat",
        invite: [this.confUserId]
    }).then(function(res) {
        return new Room(res.room_id);
    });
};

/**
 * Check if this room member is in fact a conference bot.
 * @param {RoomMember} The room member to check
 * @return {boolean} True if it is a conference bot.
 */
module.exports.isConferenceUser = function(roomMember) {
    if (roomMember.userId.indexOf("@" + USER_PREFIX) !== 0) {
        return false;
    }
    var base64part = roomMember.userId.split(":")[0].substring(1 + USER_PREFIX.length);
    if (base64part) {
        var decoded = new Buffer(base64part, "base64").toString();
        // ! $STUFF : $STUFF
        return /^!.+:.+/.test(decoded);
    }
    return false;
};

module.exports.ConferenceCall = ConferenceCall;

