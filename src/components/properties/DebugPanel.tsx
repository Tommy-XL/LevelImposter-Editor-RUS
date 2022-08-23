import { Button, Card, Intent, Menu } from "@blueprintjs/core";
import { MenuItem2 } from "@blueprintjs/popover2";
import React from "react";
import useSelectedElem from "../../hooks/jotai/useSelectedElem";
import { useSettingsValue } from "../../hooks/jotai/useSettings";
import PanelContainer from "./PanelContainer";

const TYPE_INTENTS: Record<string, Intent> = {
    "string": Intent.PRIMARY,
    "number": Intent.SUCCESS,
    "boolean": Intent.WARNING,
    "object": Intent.DANGER,
    "array": Intent.DANGER
};

export default function DebugPanel() {
    const settings = useSettingsValue();
    const [selectedElem, setSelectedElem] = useSelectedElem();
    const [selectedKey, setSelectedKey] = React.useState<string | undefined>(undefined);

    const editKey = (key: string) => {
        if (selectedKey === key)
            setSelectedKey(undefined);
        else
            setSelectedKey(key);
    }

    if (!selectedElem || !settings.isDevMode)
        return null;

    const keys = Object.keys(selectedElem.properties);
    const values = Object.values(selectedElem.properties);

    return (
        <PanelContainer title="Debug">
            <Button
                fill
                text="Print to Console"
                icon="console"
                onClick={() => {
                    console.log(selectedElem);
                }} />

            <Menu>
                {keys.map((key, index) => {
                    const value = values[index];
                    const stringValue = (value !== undefined && value !== null) ? value.toString() : "UNDEFINED";
                    return (
                        <>
                            <MenuItem2
                                key={key}
                                text={key}
                                intent={TYPE_INTENTS[typeof value]}
                                onClick={() => {
                                    editKey(key);
                                }}
                            />
                            {selectedKey === key && (
                                <Card>
                                    <pre>{typeof value}</pre>
                                    <pre>{stringValue.replaceAll(",", ",\n")}</pre>
                                </Card>
                            )}
                        </>
                    );
                })}
            </Menu>
        </PanelContainer>
    );
}
