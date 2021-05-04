import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
} from "@material-ui/core";
import * as React from "react";
import { UserNicknameChangeDialog } from "./UserNicknameChangeDialog";

function NicknameCell(props) {
    const user = props.user;
    const currUserId = props.currUserId;
    const onRequestNameDialogOpen = props.onRequestNameDialogOpen;

    if (user.id === currUserId) {
        return (
            <TableCell>
                <Typography fontWeight={900}>{user.nickname}</Typography>
                <Button
                    variant="outlined"
                    color="primary"
                    onClick={onRequestNameDialogOpen}
                >
                    Change name
                </Button>
            </TableCell>
        );
    } else {
        return <TableCell> {user.nickname} </TableCell>;
    }
}

export function UserListDialog(props) {
    const isOpen = props.isOpen;
    const onRequestClose = props.onRequestClose;
    const userList = props.userList;
    const currUserId = props.currUserId;

    const [isNameDialogOpen, setNameDialogOpen] = React.useState(false);

    return (
        <Dialog key="dialog" open={isOpen} onClose={onRequestClose}>
            <UserNicknameChangeDialog
                isOpen={isNameDialogOpen}
                onRequestClose={() => setNameDialogOpen(false)}
            />
            <DialogTitle id="form-dialog-title">Users</DialogTitle>

            <DialogContent>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Nickname</TableCell>
                            <TableCell>Activity</TableCell>
                            <TableCell>Color</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {Object.values(userList).map((user) => (
                            <TableRow key={user.id}>
                                <NicknameCell
                                    user={user}
                                    currUserId={currUserId}
                                    onRequestNameDialogOpen={() =>
                                        setNameDialogOpen(true)
                                    }
                                />
                                <TableCell> {user.activity_text} </TableCell>
                                <TableCell>
                                    <section
                                        style={{
                                            height: "50px",
                                            backgroundColor: user.color,
                                        }}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </DialogContent>

            <DialogActions>
                <Button onClick={onRequestClose} color="primary">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}
