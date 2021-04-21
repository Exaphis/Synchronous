import * as React from "react";
import {GenericFieldChangeDialog} from "./GenericFieldChangeDialog";

export function WorkspaceNicknameChangeDialog(props) {
    const {
        isOpen,
        onRequestClose,
        onNicknameUpdateAsync
    } = props;

    function setNewNickname(nicknameFieldValue) {
        onNicknameUpdateAsync(nicknameFieldValue)
            .then(() => {
                onRequestClose();
            }, e => {
                throw e
            });
    }

    return (
        <GenericFieldChangeDialog isOpen={isOpen} onRequestClose={onRequestClose}
                                  onChangeField={setNewNickname}
                                  fieldName={'workspace nickname'} />
    );
}
