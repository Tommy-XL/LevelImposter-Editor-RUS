import { Button, ButtonGroup, ControlGroup, Divider, H5, InputGroup, NumericInput } from "@blueprintjs/core";
import React from "react";
import useKeyboard from "../../hooks/input/useKeyboard";
import useElement, { removeElement } from "../../hooks/useElement";
import useSelected from "../../hooks/useSelected";
import GUID from "../../types/generic/GUID";

export default function TransformPanel() {
    const [selectedID, setSelectedID] = useSelected();
    const [element, setElement] = useElement(selectedID);
    const keys = useKeyboard();
    const [x, setX] = React.useState("");
    const [y, setY] = React.useState("");
    const [z, setZ] = React.useState("");
    const [xScale, setXScale] = React.useState("");
    const [yScale, setYScale] = React.useState("");
    const [rotation, setRotation] = React.useState("");

    React.useEffect(() => {
        if (keys["Delete"] && selectedID !== "") {
            removeElement(selectedID);
            setSelectedID("" as GUID);
        }
    }, [keys, selectedID, setElement]);

    React.useEffect(() => {
        setX(element.x.toString());
        setY(element.y.toString());
        setZ(element.z.toString());
        setXScale(element.xScale.toString());
        setYScale(element.yScale.toString());
        setRotation(element.rotation.toString());
    }, [element, setX, setY, setZ, setXScale, setYScale, setRotation]);

    if (selectedID === "")
        return null;

    return (
        <div className="transform-panel">
            <H5>Properties</H5>
            <Divider />
            <InputGroup
                placeholder="Name"
                large
                onChange={(e) => { setElement({ ...element, name: e.target.value }); }}
                value={element.name}
            />
            <ControlGroup fill style={{ marginTop: 15 }}>
                <NumericInput
                    fill
                    placeholder="X"
                    onValueChange={(numVal, strVal) => { setX(strVal); numVal && setElement({ ...element, x: numVal }); }}
                    minorStepSize={0.001}
                    value={x}
                />
                <NumericInput
                    fill
                    placeholder="Y"
                    onValueChange={(numVal, strVal) => { setY(strVal); numVal && setElement({ ...element, y: numVal }); }}
                    minorStepSize={0.001}
                    value={y}
                />
                <NumericInput
                    fill
                    placeholder="Z"
                    onValueChange={(numVal, strVal) => { setZ(strVal); numVal && setElement({ ...element, z: numVal }); }}
                    minorStepSize={0.001}
                    value={z}
                />
            </ControlGroup>
            <ControlGroup fill>
                <NumericInput
                    fill
                    placeholder="X Scale"
                    onValueChange={(numVal, strVal) => { setXScale(strVal); numVal && setElement({ ...element, xScale: numVal }); }}
                    minorStepSize={0.001}
                    value={xScale}
                />
                <NumericInput
                    fill
                    placeholder="Y Scale"
                    onValueChange={(numVal, strVal) => { setYScale(strVal); numVal && setElement({ ...element, yScale: numVal }); }}
                    minorStepSize={0.001}
                    value={yScale}
                />
            </ControlGroup>
            <ControlGroup fill>
                <NumericInput
                    fill
                    placeholder="Rotation"
                    onValueChange={(numVal, strVal) => { setRotation(strVal); numVal && setElement({ ...element, rotation: numVal }); }}
                    minorStepSize={0.001}
                    value={rotation}
                />
            </ControlGroup>
            <ButtonGroup minimal style={{ marginTop: 10 }} fill>
                <Button
                    fill
                    icon={element.properties.isLocked ? "lock" : "unlock"}
                    text={element.properties.isLocked ? "Unlock" : "Lock"}
                    onClick={() => { setElement({ ...element, properties: { ...element.properties, isLocked: !element.properties.isLocked } }); }}
                />
                <Button
                    fill
                    icon="trash"
                    text="Remove"
                    onClick={() => { removeElement(selectedID); setSelectedID("" as GUID) }}
                />
            </ButtonGroup>
        </div>
    );
}
