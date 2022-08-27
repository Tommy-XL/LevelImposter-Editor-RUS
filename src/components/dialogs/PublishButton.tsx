import { Button, ButtonGroup, Classes, Dialog, FormGroup, InputGroup, ProgressBar, Switch, TextArea } from "@blueprintjs/core";
import { Tooltip2 } from "@blueprintjs/popover2";
import { signOut } from "firebase/auth";
import { collection, doc, setDoc } from "firebase/firestore";
import { ref, StorageReference, uploadBytesResumable } from "firebase/storage";
import React from "react";
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db, storage } from "../../hooks/Firebase";
import generateGUID from "../../hooks/generateGUID";
import useMap from "../../hooks/jotai/useMap";
import { useSettingsValue } from "../../hooks/jotai/useSettings";
import useToaster from "../../hooks/useToaster";
import { THUMBNAIL_WIDTH } from "../../types/generic/Constants";
import GUID from "../../types/generic/GUID";
import LIMap from "../../types/li/LIMap";
import LIMetadata from "../../types/li/LIMetadata";
import SignIn from "../SignIn";
import AgreementDialog from "./AgreementDialog";
import PublishInfoDialog from "./PublishInfoDialog";

export default function PublishButton() {
    const toaster = useToaster();
    const [isOpen, setIsOpen] = React.useState(false);
    const [isAgreementOpen, setIsAgreementOpen] = React.useState(false);
    const [isInfoOpen, setIsInfoOpen] = React.useState(false);
    const settings = useSettingsValue();
    const [map, setMap] = useMap();
    const [user] = useAuthState(auth);
    const [thumbnail, setThumbnail] = React.useState<string | undefined>(undefined);
    const [isPublishing, setIsPublishing] = React.useState(false);
    const [uploadProgress, setProgress] = React.useState(0);

    const isLoggedIn = user !== null;
    const isUploaded = map.id !== "" && user?.uid === map.authorID;


    const publishMap = (id?: GUID) => {
        if (!user?.emailVerified) {
            toaster.danger("You must verify your email before you can publish a map.");
            return;
        }

        setIsPublishing(true);
        setProgress(0);

        const mapData: LIMap = {
            id: id || map.id,
            v: map.v,
            name: map.name,
            description: map.description,
            isPublic: map.isPublic,
            isVerified: false,
            authorID: user?.uid ? user.uid : "",
            authorName: user?.displayName ? user.displayName : "",
            createdAt: new Date().getTime(),
            likeCount: 0,
            elements: map.elements,
            properties: map.properties
        };
        const mapJSON = JSON.stringify(mapData);
        const mapStorageRef = ref(storage, `maps/${user?.uid}/${mapData.id}.lim`);
        const imgStorageRef = ref(storage, `maps/${user?.uid}/${mapData.id}.png`);
        const storeRef = collection(db, "maps");
        const docRef = doc(storeRef, mapData.id);

        const uploadToStorage = (name: string, data: string, ref: StorageReference) => {
            const byteData = new TextEncoder().encode(data);
            const uploadTask = uploadBytesResumable(ref, byteData);

            return new Promise<void>((resolve, reject) => {
                uploadTask.on("state_changed", (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log(`${name} upload is ${progress}% done`);
                    setProgress(progress / 100);
                }, (err) => {
                    reject(err);
                }, () => {
                    console.log(`${name} is uploaded to firebase storage: ${ref.fullPath}`);
                    resolve();
                });
            });
        }

        const uploadToFirestore = () => {
            const metadata: LIMetadata = {
                v: mapData.v,
                id: mapData.id,
                name: mapData.name,
                description: mapData.description,
                isPublic: mapData.isPublic,
                isVerified: mapData.isVerified,
                authorID: mapData.authorID,
                authorName: mapData.authorName,
                createdAt: mapData.createdAt,
                likeCount: mapData.likeCount
            };

            return new Promise<void>((resolve, reject) => {
                setDoc(docRef, metadata).then(() => {
                    console.log(`Map published to firestore: ${docRef.path}`);
                    toaster.success("Map published successfully!", "https://levelimposter.net/#/map/" + mapData.id);
                    resolve();
                }).catch((err) => {
                    reject(err);
                });
            });
        }

        uploadToStorage("LIM", mapJSON, mapStorageRef).then(async () => {
            if (thumbnail)
                return uploadToStorage("Thumbnail", thumbnail, imgStorageRef);
        }).then(() => {
            return uploadToFirestore();
        }).then(() => {
            setIsPublishing(false);
            setIsOpen(false);
            setMap(mapData);
        }).catch((err) => {
            console.error(err);
            toaster.danger(err.message);
            setIsPublishing(false);
        });
    }

    const resizeImage = (img: string, width: number, height: number) => {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            const image = new Image();
            image.src = img;
            image.onload = () => {
                canvas.width = width;
                canvas.height = height;
                ctx?.drawImage(image, 0, 0, width, height);
                resolve(canvas.toDataURL());
            }
            image.onerror = (err) => {
                reject(err);
            }
        });
    }

    const uploadThumbnail = () => {
        console.log("Showing Upload Dialog");
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.onchange = () => {
            console.log("Uploaded File");
            if (input.files === null)
                return;
            const file = input.files[0];
            const reader = new FileReader();
            reader.onload = () => {
                if (reader.result === null)
                    return;
                resizeImage(reader.result.toString(), THUMBNAIL_WIDTH, THUMBNAIL_WIDTH).then((img) => {
                    setThumbnail(img as string);
                });
            }
            reader.readAsDataURL(file);
        }
        input.click();
    }


    return (
        <>
            <Tooltip2
                content={"Publish Map"}
                position="bottom">

                <Button
                    className={Classes.MINIMAL}
                    icon="cloud-upload"
                    onClick={() => { setIsOpen(true) }} />

            </Tooltip2>

            {/*  Login  */}

            <Dialog
                isOpen={isOpen && !isLoggedIn}
                onClose={() => { setIsOpen(false) }}
                title="Login"
                portalClassName={settings.isDarkMode === false ? "" : "bp4-dark"}>

                <SignIn />

            </Dialog>

            {/*  Publish  */}

            <Dialog
                isOpen={isOpen && isLoggedIn}
                onClose={() => { setIsOpen(isPublishing) }}
                title="Publish"
                portalClassName={settings.isDarkMode === false ? "" : "bp4-dark"}>

                <div style={{ margin: 15 }} >

                    <FormGroup label={"Signed in as " + user?.displayName} disabled={isPublishing}>
                        <Button
                            disabled={isPublishing}
                            icon={"user"}
                            text={"Sign Out"}
                            intent={"danger"}
                            onClick={() => {
                                signOut(auth);
                            }} />
                    </FormGroup>

                    <FormGroup disabled={isPublishing} style={{ textAlign: "center" }} label={"Thumbnail"}>
                        <img
                            src={thumbnail}
                            style={{ width: THUMBNAIL_WIDTH, height: THUMBNAIL_WIDTH, borderRadius: 5, border: "1px solid rgb(96, 96, 96)" }} />
                        <ButtonGroup minimal fill>
                            <Button
                                fill
                                minimal
                                disabled={isPublishing}
                                icon={"refresh"}
                                text={"Reset"}
                                onClick={() => {
                                    setThumbnail(undefined);
                                }} />
                            <Button
                                fill
                                minimal
                                disabled={isPublishing}
                                icon={"upload"}
                                text={"Upload"}
                                onClick={uploadThumbnail} />
                        </ButtonGroup>
                    </FormGroup>
                    <FormGroup label="Map Name" disabled={isPublishing}>
                        <InputGroup
                            large
                            disabled={isPublishing}
                            placeholder="Title"
                            value={map.name}
                            onChange={(e) => { setMap({ ...map, name: e.target.value }) }} />
                    </FormGroup>
                    <FormGroup label="Map Description" disabled={isPublishing}>
                        <TextArea
                            fill
                            growVertically
                            large
                            disabled={isPublishing}
                            placeholder="Description"
                            value={map.description}
                            onChange={(e) => { setMap({ ...map, description: e.target.value }) }} />
                    </FormGroup>
                    <FormGroup label="Public" disabled={isPublishing}>
                        <Switch
                            large
                            disabled={isPublishing}
                            checked={map.isPublic}
                            onChange={(e) => { setMap({ ...map, isPublic: e.currentTarget.checked }) }} />
                    </FormGroup>

                    <Button
                        style={{ marginRight: 10 }}
                        disabled={isPublishing}
                        icon={"cloud-upload"}
                        text={"Upload New"}
                        intent={"primary"}
                        onClick={() => {
                            setIsAgreementOpen(true);
                        }}
                    />

                    {isUploaded && (
                        <Button
                            disabled={isPublishing}
                            icon={"saved"}
                            text={"Replace Existing"}
                            intent={"danger"}
                            onClick={() => {
                                publishMap();
                            }}
                        />
                    )}

                    {isPublishing &&
                        <div style={{ marginTop: 15 }}>
                            <ProgressBar
                                intent={"primary"}
                                value={uploadProgress} />
                        </div>
                    }
                </div>

            </Dialog>

            <AgreementDialog
                isOpen={isAgreementOpen}
                onAgree={() => {
                    setIsAgreementOpen(false);
                    setIsInfoOpen(true);
                }}
                onCancel={() => {
                    setIsAgreementOpen(false);
                }}
            />
            <PublishInfoDialog
                isOpen={isInfoOpen}
                onAgree={() => {
                    setIsInfoOpen(false);
                    publishMap(generateGUID());
                }}
                onCancel={() => {
                    setIsInfoOpen(false);
                }}
            />

        </>
    );
}