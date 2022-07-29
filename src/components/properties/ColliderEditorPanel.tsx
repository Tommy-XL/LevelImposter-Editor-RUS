import { Button, Card, ControlGroup, FormGroup, H6, NumericInput, Switch } from "@blueprintjs/core";
import { useSelectedColliderID, useSelectedColliderValue } from "../../hooks/jotai/useSelectedCollider";
import useSelectedElem from "../../hooks/jotai/useSelectedElem";
import LICollider from "../../types/li/LICollider";

export default function ColliderEditorPanel() {
    const [selectedElem, setSelectedElem] = useSelectedElem();
    const [selectedColliderID, setSelectedColliderID] = useSelectedColliderID();
    const selectedCollider = useSelectedColliderValue();

    const delCollider = (collider: LICollider) => {
        if (!selectedElem)
            return;
        selectedElem.properties.colliders = selectedElem.properties.colliders?.filter(c => c.id !== collider.id);
        setSelectedElem(selectedElem);
        if (selectedColliderID === collider.id)
            setSelectedColliderID(undefined);
    }

    if (!selectedCollider || !selectedElem)
        return null;

    return (
        <Card>
            <H6>Edit Collider:</H6>

            <Switch
                label="Is Solid"
                checked={selectedCollider.isSolid}
                disabled={selectedElem.type === "util-room"}
                onChange={(e) => {
                    selectedCollider.isSolid = e.currentTarget.checked;
                    setSelectedElem({ ...selectedElem });
                }} />
            <Switch
                label="Blocks Light"
                checked={selectedCollider.blocksLight}
                disabled={selectedElem.type === "util-room"}
                onChange={(e) => {
                    selectedCollider.blocksLight = e.currentTarget.checked;
                    setSelectedElem({ ...selectedElem });
                }} />
            <FormGroup label="Points">
                <NumericInput
                    fill
                    disabled={!selectedCollider}
                    min={2}
                    value={selectedCollider?.points.length}
                    onValueChange={(value) => {
                        if (value < 0)
                            return;
                        for (let i = 0; i < value; i++) {
                            if (selectedCollider.points[i] == null)
                                selectedCollider.points[i] = { x: 0, y: 0 };
                        }
                        for (let i = selectedCollider.points.length - 1; i >= value; i--) {
                            selectedCollider.points.splice(i, 1);
                        }
                        setSelectedElem({ ...selectedElem });
                    }} />
            </FormGroup>
            <div>
                {selectedCollider.points.map((point, index) => (
                    <ControlGroup fill key={index}>
                        <NumericInput
                            fill
                            disabled={!selectedCollider}
                            minorStepSize={0.001}
                            stepSize={0.01}
                            majorStepSize={0.1}
                            value={point.x.toString()}
                            onValueChange={(value) => {
                                selectedCollider.points[index].x = value;
                                setSelectedElem({ ...selectedElem });
                            }} />
                        <NumericInput
                            fill
                            disabled={!selectedCollider}
                            minorStepSize={0.001}
                            stepSize={0.01}
                            majorStepSize={0.1}
                            value={point.y.toString()}
                            onValueChange={(value) => {
                                selectedCollider.points[index].y = value;
                                setSelectedElem({ ...selectedElem });
                            }} />
                    </ControlGroup>
                ))}
            </div>
            <div style={{ marginTop: 10 }}>
                <Button icon="tick" intent="success" onClick={() => setSelectedColliderID(undefined)} style={{ marginRight: 5 }} />
                <Button icon="trash" intent="danger" onClick={() => delCollider(selectedCollider)} />
            </div>
        </Card>
    )
}