import * as React from "react";
import {GenericFieldChangeDialog} from "./GenericFieldChangeDialog";

export function WorkspaceNicknameChangeDialog(props) {
    const {
        isOpen,
        onRequestClose,
        onNicknameUpdateAsync
    } = props;

    return (
        <GenericFieldChangeDialog isOpen={isOpen} onRequestClose={onRequestClose}
                                  onChangeField={onNicknameUpdateAsync}
                                  fieldName={'workspace nickname'} />
    );
}
