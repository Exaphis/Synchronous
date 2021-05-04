import * as React from "react";
import { GenericFieldChangeDialog } from "./GenericFieldChangeDialog";

export function WorkspacePasswordChangeDialog(props) {
    const { isOpen, onRequestClose, onPasswordChangeAsync } = props;

    return (
        <GenericFieldChangeDialog
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            onChangeField={onPasswordChangeAsync}
            fieldName={"password"}
            caption={"Empty to remove"}
        />
    );
}
