import { Application, Session } from "mydog";

export default function (app: Application) {
    return new Handler(app);
}

let uid = 1;

class Handler {
    app: Application;
    constructor(app: Application) {
        this.app = app;
    }
    getChatInfo(msg: any, session: Session, next: Function) {
        if (!session.uid) {
            session.bind(uid++);
            session.setCloseCb(onUserLeave);
        }
        this.app.rpc.toServer(msg.id).chat.chatRemote.getRooms(function (err: any, data: any) {
            if (err) {
                next({});
                return;
            }
            next(data);
        });
    };

    newRoom(msg: any, session: Session, next: Function) {
        msg.uid = session.uid;
        msg.sid = session.sid;
        var self = this;
        self.app.rpc.toServer(msg.id).chat.chatRemote.newRoom(msg, function (err: any, data: any) {
            if (err) {
                next({ "status": -2 });
                return;
            }
            if (data.status === 0) {
                session.set("chatServerId", data.serverId);
                session.set("roomId", data.roomId);
                session.set("playerId", data.playerId);
            }
            next(data);
        });
    };

    joinRoom(msg: any, session: Session, next: Function) {
        msg.uid = session.uid;
        msg.sid = session.sid;
        var self = this;
        self.app.rpc.toServer(msg.id).chat.chatRemote.joinRoom(msg, function (err: any, data: any) {
            if (err) {
                next({ "status": -2 });
                return;
            }
            if (data.status === 0) {
                session.set("chatServerId", data.serverId);
                session.set("roomId", data.roomId);
                session.set("playerId", data.playerId);
            }
            next(data);
        });
    };
}

var onUserLeave = function (app: Application, session: Session) {
    console.log("one client out");
    if (session.get("chatServerId")) {
        app.rpc.toServer(session.get("chatServerId")).chat.chatRemote.leaveRoom({
            "roomId": session.get("roomId"),
            "playerId": session.get("playerId")
        });
    }
};