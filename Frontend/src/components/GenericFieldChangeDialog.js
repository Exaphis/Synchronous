import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField, Typography
} from "@material-ui/core";
import * as React from "react";

export function GenericFieldChangeDialog(props) {
    const {
        isOpen,
        onRequestClose,
        onChangeField,
        fieldName,
        caption
    } = props;

    let fieldLabel = props.fieldLabel;
    if (!fieldLabel) {
        fieldLabel = fieldName;
    }

    const [dialogError, setDialogError] = React.useState('');
    const fieldValueRef = React.useRef('');

    if (!isOpen && dialogError){
        setDialogError('');
    }

    function changeField() {
        try {
            onChangeField(fieldValueRef.current);
        } catch (e) {
            setDialogError(e.message);
        }
    }

    return (
        <Dialog key="dialog" open={isOpen} onClose={onRequestClose}>
            <DialogTitle id="form-dialog-title">Change {fieldName}</DialogTitle>
            <DialogContent>
                {caption && <Typography color="textSecondary">{caption}</Typography>}
                <TextField
                    error={dialogError !== ''}
                    helperText={dialogError}
                    autoFocus
                    margin="dense"
                    id="name"
                    label={`New ${fieldLabel}`}
                    type="text"
                    fullWidth
                    onChange={ev => (fieldValueRef.current = ev.target.value)}
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
