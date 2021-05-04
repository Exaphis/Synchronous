import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Typography,
} from "@material-ui/core";
import * as React from "react";

export function GenericFieldChangeDialog(props) {
    const { isOpen, onRequestClose, onChangeField, fieldName, caption } = props;

    let fieldLabel = fieldName;
    if ("fieldLabel" in props) {
        fieldLabel = props.fieldLabel;
    }

    const [dialogError, setDialogError] = React.useState("");
    const fieldValueRef = React.useRef("");

    if (!isOpen && dialogError) {
        setDialogError("");
    }

    async function changeField() {
        try {
            await onChangeField(fieldValueRef.current);
            onRequestClose();
        } catch (e) {
            setDialogError(e.message);
        }
    }

    return (
        <Dialog key="dialog" open={isOpen} onClose={onRequestClose}>
            <DialogTitle id="form-dialog-title">Change {fieldName}</DialogTitle>
            <DialogContent>
                {caption && (
                    <Typography color="textSecondary">{caption}</Typography>
                )}
                <TextField
                    error={dialogError !== ""}
                    helperText={dialogError}
                    autoFocus
                    margin="dense"
                    id="name"
                    label={`New ${fieldLabel}`}
                    type="text"
                    fullWidth
                    onChange={(ev) => (fieldValueRef.current = ev.target.value)}
                />
            </DialogContent>

            <DialogActions>
                <Button onClick={onRequestClose} color="primary">
                    Cancel
                </Button>

                <Button onClick={changeField} color="primary">
                    Confirm
                </Button>
            </DialogActions>
        </Dialog>
    );
}
