import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
} from "@mui/material";

interface PlayerNameDialogProps {
  open: boolean;
  onSubmit: (name: string) => void;
}

const PlayerNameDialog: React.FC<PlayerNameDialogProps> = ({
  open,
  onSubmit,
}) => {
  const [name, setName] = useState<string>("");

  const handleSubmit = () => {
    onSubmit(name);
  };

  return (
    <Dialog open={open} maxWidth="xs" fullWidth>
      <DialogTitle>Enter Your Name</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            autoFocus
            label="Player Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSubmit();
              }
            }}
            slotProps={{ input: { inputProps: { maxLength: 20 } } }}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={!name.trim()}
        >
          Continue
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PlayerNameDialog;
