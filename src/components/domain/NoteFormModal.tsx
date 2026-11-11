import { useState, type FormEvent } from "react";
import { ChevronRight } from "lucide-react";
import styles from "./NoteFormModal.module.css";
import { Button, Modal, TextAreaField, TextField } from "@/components/ui";
import { useCreateNote } from "@/hooks/useCare";
import type { CreateNoteInput } from "@/types";

const shortcuts: Omit<CreateNoteInput, "patientId">[] = [
  { title: "Tomou todos os remédios", description: "Todas as doses do dia foram tomadas.", type: "medicacao" },
  { title: "Passou mal após o remédio", description: "Relatou mal-estar depois de tomar o remédio.", type: "sintoma", warn: true },
  { title: "Parou o remédio sem falar com o médico", description: "Interrompeu o tratamento por conta própria.", type: "sintoma", warn: true },
];

interface NoteFormModalProps {
  open: boolean;
  onClose: () => void;
  patientId: string;
  authorName: string;
}

export function NoteFormModal({ open, onClose, patientId, authorName }: NoteFormModalProps) {
  const createNote = useCreateNote(patientId, authorName);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const save = async (input: Omit<CreateNoteInput, "patientId">) => {
    await createNote.mutateAsync({ ...input, patientId });
    setTitle("");
    setDescription("");
    onClose();
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    void save({ title: title.trim(), description: description.trim(), type: "anotacao" });
  };

  return (
    <Modal open={open} onClose={onClose} title="Nova anotação">
      <p className={styles.help}>Escolha um atalho ou escreva o que aconteceu. A anotação fica visível para a rede e para o médico.</p>
      {shortcuts.map((s) => (
        <button key={s.title} className={styles.shortcut} onClick={() => save(s)} disabled={createNote.isPending}>
          {s.title} <ChevronRight size={18} />
        </button>
      ))}
      <form onSubmit={handleSubmit}>
        <TextField label="Título" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: Caminhada da manhã" />
        <TextAreaField label="Detalhes (opcional)" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Escreva aqui..." />
        <Button type="submit" fullWidth loading={createNote.isPending} disabled={!title.trim()}>Salvar anotação</Button>
      </form>
    </Modal>
  );
}
