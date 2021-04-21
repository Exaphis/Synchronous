import * as React from "react";
import {GenericFieldChangeDialog} from "./GenericFieldChangeDialog";

export function WorkspacePasswordChangeDialog(props) {
    const {
        isOpen,
        onRequestClose,
        onPasswordChangeAsync
    } = props;

    function setNewPassword(password) {
        onPasswordChangeAsync(password)
            .then(() => {
                onRequestClose();
            }, e => {
                throw e
            });
    }

    return (
        <GenericFieldChangeDialog isOpen={isOpen} onRequestClose={onRequestClose}
                                  onChangeField={setNewPassword}
                                  fieldName={'password'}
                                  caption={'Empty to remove'}
        />
    );
}
