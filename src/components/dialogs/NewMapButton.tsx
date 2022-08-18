import { Button, Classes, Dialog } from "@blueprintjs/core";
import { Tooltip2 } from "@blueprintjs/popover2";
import React from "react";
import { useMapReset } from "../../hooks/jotai/useMap";
import { useSetSelectedColliderID } from "../../hooks/jotai/useSelectedCollider";
import { useSetSelectedElemID } from "../../hooks/jotai/useSelectedElem";
import { useSettingsValue } from "../../hooks/jotai/useSettings";

export default function NewMapButton() {
    const settings = useSettingsValue();
    const resetMap = useMapReset();
    const setSelectedID = useSetSelectedElemID();
    const setColliderID = useSetSelectedColliderID();
    const [isVisible, setIsVisible] = React.useState(false);

    const onClear = () => {
        resetMap();
        setSelectedID(undefined);
        setColliderID(undefined);
        setIsVisible(false);
    }

    return (
        <>
            <Tooltip2
                content="Create a new map"
                position="bottom">

                <Button
                    className={Classes.MINIMAL}
                    icon="document"
                    onClick={() => { setIsVisible(true); }} />

            </Tooltip2>

            <Dialog
                isOpen={isVisible}
                onClose={() => { setIsVisible(false); }}
                title="New Map"
                portalClassName={settings.isDarkMode ? "bp4-dark" : ""}>

                <div style={{ margin: 15 }}>
                    <p>Are you sure you want to create a new map?</p>
                    <p>This will delete all elements and reset the map.</p>

                    <Button onClick={() => { onClear(); }} text="Yes" intent="danger" style={{ marginRight: 10 }} />
                    <Button onClick={() => { setIsVisible(false); }} text="Cancel" />
                </div>
            </Dialog>
        </>
    );
}