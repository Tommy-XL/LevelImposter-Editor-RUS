import { Button } from "@blueprintjs/core";
import { Popover2 } from "@blueprintjs/popover2";
import React from "react";
import { ChromePicker, Color, SketchPicker } from "react-color";
import LIColor from "../types/li/LIColor";

export default function ColorPicker(props: { title: string, onChange: (color: LIColor) => void, color: LIColor, onOpen?: () => void, onClose?: () => void }) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [color, setColor] = React.useState(props.color);

    React.useEffect(() => {
        setColor(props.color);
    }, [props.color]);

    return (
        <div>
            <Popover2
                fill
                hasBackdrop={true}
                isOpen={isOpen}
                onInteraction={(nextOpenState) => setIsOpen(nextOpenState)}
                onOpened={props.onOpen}
                onClosed={props.onClose}
                content={
                    <ChromePicker
                        styles={{
                            default: {
                                body: {
                                    backgroundColor: "#2f343c"
                                }
                            }
                        } as any}
                        color={color}
                        onChange={(color) => {
                            setColor(color.rgb as LIColor);
                        }}
                        onChangeComplete={(color) => {
                            props.onChange(color.rgb as LIColor);
                        }}
                    />
                }>
                <Button
                    onClick={() => setIsOpen(!isOpen)}
                    fill
                    icon="tint"
                    text={props.title}
                />
            </Popover2>
        </div>
    );
}