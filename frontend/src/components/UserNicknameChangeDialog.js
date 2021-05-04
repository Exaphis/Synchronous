import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
} from "@material-ui/core";
import * as React from "react";
import { CLIENT_MSG_TYPE, PUBSUB_TOPIC, SERVER_MSG_TYPE } from "../api";
import { PubSub } from "pubsub-js";

export function UserNicknameChangeDialog(props) {
    const isOpen = props.isOpen;
    const onRequestClose = props.onRequestClose;

    const [nameDialogError, setNameDialogError] = React.useState("");
    const nicknameFieldValueRef = React.useRef("");

    if (!isOpen && nameDialogError) {
        setNameDialogError("");
    }

    function sendUserNicknameChange() {
        PubSub.publish(PUBSUB_TOPIC.WS_SEND_MSG_TOPIC, {
            type: CLIENT_MSG_TYPE.NICKNAME_CHANGE,
            nickname: nicknameFieldValueRef.current,
        });
    }

    React.useEffect(() => {
        let token = PubSub.subscribe(
            SERVER_MSG_TYPE.NICKNAME_CHANGE,
            (msg, data) => {
                if (data.success) {
                    onRequestClose();
                } else {
                    setNameDialogError(data.details);
                }
            }
        );

        return function cleanup() {
            PubSub.unsubscribe(token);
        };
    }, [onRequestClose]);

    return (
        <Dialog key="dialog" open={isOpen} onClose={onRequestClose}>
            <DialogTitle id="form-dialog-title">Change name</DialogTitle>

            <DialogContent>
                <TextField
                    error={nameDialogError !== ""}
                    helperText={nameDialogError}
                    autoFocus
                    margin="dense"
                    id="name"
                    label="New Nickname"
                    type="text"
                    fullWidth
                    onChange={(ev) =>
                        (nicknameFieldValueRef.current = ev.target.value)
                    }
                />
            </DialogContent>

            <DialogActions>
                <Button onClick={onRequestClose} color="primary">
                    Cancel
                </Button>

                <Button onClick={sendUserNicknameChange} color="primary">
                    Change name
                </Button>
            </DialogActions>
        </Dialog>
    );
}
