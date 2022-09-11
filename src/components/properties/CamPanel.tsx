import { ControlGroup, FormGroup, NumericInput } from "@blueprintjs/core";
import { useSaveHistory } from "../../hooks/jotai/useHistory";
import useSelectedElem from "../../hooks/jotai/useSelectedElem";
import useTranslation from "../../hooks/useTranslation";
import PanelContainer from "./PanelContainer";

export default function CamPanel() {
    const translation = useTranslation();
    const [element, setElement] = useSelectedElem();
    const saveHistory = useSaveHistory();

    if (!element
        || element.type !== "util-cam")
        return null;

    return (
        <PanelContainer title={translation.Camera}>
            <FormGroup label={translation.Offset}>
                <ControlGroup fill>
                    <NumericInput
                        key={element.id + "-camXOffset"}
                        fill
                        defaultValue={element.properties.camXOffset === undefined ? 0 : element.properties.camXOffset}
                        minorStepSize={0.1}
                        stepSize={0.5}
                        majorStepSize={1}
                        onValueChange={(val) => {
                            saveHistory();
                            !isNaN(val) && setElement({ ...element, properties: { ...element.properties, camXOffset: val } });
                        }} />
                    <NumericInput
                        key={element.id + "-camYOffset"}
                        fill
                        defaultValue={element.properties.camYOffset === undefined ? 0 : element.properties.camYOffset}
                        minorStepSize={0.1}
                        stepSize={0.5}
                        majorStepSize={1}
                        onValueChange={(val) => {
                            saveHistory();
                            !isNaN(val) && setElement({ ...element, properties: { ...element.properties, camYOffset: val } });
                        }} />
                </ControlGroup>
            </FormGroup>
            <FormGroup label={translation.Zoom}>
                <NumericInput
                    key={element.id + "-camZoom"}
                    fill
                    defaultValue={element.properties.camZoom === undefined ? 3 : element.properties.camZoom}
                    minorStepSize={0.1}
                    stepSize={0.5}
                    majorStepSize={1}
                    onValueChange={(val) => {
                        saveHistory();
                        !isNaN(val) && setElement({ ...element, properties: { ...element.properties, camZoom: val } });
                    }} />
            </FormGroup>
        </PanelContainer>
    );
}