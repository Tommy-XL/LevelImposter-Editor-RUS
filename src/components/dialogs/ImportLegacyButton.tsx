import { Button, Classes } from "@blueprintjs/core";
import generateGUID, { DEFAULT_GUID } from '../../hooks/generateGUID';
import { useSetMap } from "../../hooks/jotai/useMap";
import LIElement from "../../types/li/LIElement";
import LILegacyFile from "../../types/li/LILegacyFile";
import { MAP_FORMAT_VER } from "../../types/li/LIMetadata";

export default function ImportLegacyButton() {
    const setMap = useSetMap();

    const onImport = () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "application/json";
        input.onchange = () => {
            if (input.files === null)
                return;
            const file = input.files[0];
            const reader = new FileReader();
            reader.onload = () => {
                const mapData = JSON.parse(reader.result as string) as LILegacyFile;

                // Import Objects
                const elements: LIElement[] = [];
                mapData.objs.forEach(legacyObj => {
                    const isCustomObj = legacyObj.spriteType == "custom";
                    const element: LIElement = {
                        id: generateGUID(),
                        name: legacyObj.name,
                        type: isCustomObj ? "util-blank" : legacyObj.type,
                        x: legacyObj.x,
                        y: -legacyObj.y,
                        z: legacyObj.z,
                        xScale: legacyObj.xScale * (legacyObj.flipX ? -1 : 1),
                        yScale: legacyObj.yScale * (legacyObj.flipY ? -1 : 1),
                        rotation: legacyObj.rotation,
                        properties: {
                            spriteData: isCustomObj ? legacyObj.type : undefined,
                            colliders: legacyObj.colliders.map(legacyCollider => {
                                const points = legacyCollider.points.map((p) => {
                                    return {
                                        x: p.x / legacyObj.xScale,
                                        y: p.y / legacyObj.yScale
                                    }
                                });
                                if (legacyCollider.isClosed && points.length > 1)
                                    points.push(points[0]);
                                return {
                                    id: generateGUID(),
                                    blocksLight: legacyObj.type === "util-room" ? false : legacyCollider.blocksLight,
                                    isSolid: legacyObj.type === "util-room",
                                    points,
                                }
                            })
                        }
                    };
                    elements.push(element);
                });

                // Target IDs
                mapData.objs.forEach(((legacyObj, index) => {
                    const elem = elements[index];

                    const targetIndexes = legacyObj.targetIds.map(id => mapData.objs.findIndex(obj => obj.id == id));
                    const targetElements = targetIndexes.map(index => elements[index]);

                    if (elem.type.startsWith("util-vent")) {
                        elem.properties.leftVent = targetElements[0]?.id;
                        elem.properties.middleVent = targetElements[1]?.id;
                        elem.properties.rightVent = targetElements[2]?.id;
                    }
                }))

                // Set Map
                setMap({
                    v: MAP_FORMAT_VER,
                    id: DEFAULT_GUID,
                    name: mapData.name,
                    description: "",
                    isPublic: false,
                    isVerified: false,
                    authorID: "",
                    authorName: "",
                    elements,
                    properties: {}
                });
            }
            reader.readAsText(file);
        }
        input.click();
    }

    return (
        <>
            <Button
                className={Classes.MINIMAL}
                icon="import"
                text="Import Legacy"
                onClick={onImport} />
        </>
    );
}