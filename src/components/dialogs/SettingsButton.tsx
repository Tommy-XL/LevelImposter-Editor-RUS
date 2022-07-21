import { Button, Classes, Dialog, FormGroup, Switch } from "@blueprintjs/core";
import { Tooltip2 } from "@blueprintjs/popover2";
import React from "react";
import useSettings from "../../hooks/jotai/useSettings";

export default function SettingsButton() {
    const [isOpen, setIsOpen] = React.useState(false);
    const [settings, setSettings] = useSettings();

    return (
        <>
            <Tooltip2
                content="Open Settings"
                position="bottom">

                <Button
                    className={Classes.MINIMAL}
                    icon="cog"
                    onClick={() => { setIsOpen(true) }} />

            </Tooltip2>

            <Dialog
                isOpen={isOpen}
                onClose={() => { setIsOpen(false) }}
                title="Settings"
                portalClassName={settings.isDarkMode ? "bp4-dark" : ""}>

                <div style={{ margin: 15 }} >
                    <FormGroup label="Interface">

                        <Switch
                            label="Dark Mode"
                            checked={settings.isDarkMode}
                            onChange={(e) => {
                                setSettings({ ...settings, isDarkMode: e.currentTarget.checked });
                            }} />

                        <Switch
                            label="Grid"
                            checked={settings.isGridVisible}
                            onChange={(e) => {
                                setSettings({ ...settings, isGridVisible: e.currentTarget.checked });
                            }} />

                        <Switch
                            label="Axis"
                            checked={settings.isAxisVisible}
                            onChange={(e) => {
                                setSettings({ ...settings, isAxisVisible: e.currentTarget.checked });
                            }} />

                    </FormGroup>
                </div>

            </Dialog>
        </>
    );
}