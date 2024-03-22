import React, { useEffect, useState } from "react";
import {
  Button,
  Flex,
  SectionHeading,
  TextInput,
} from "@contentful/f36-components";
import { FieldAppSDK } from "@contentful/app-sdk";
import { useSDK } from "@contentful/react-apps-toolkit";

const Field = () => {
  const sdk = useSDK<FieldAppSDK>();
  const [newPair, setNewPair] = useState({ key: "", value: "" });
  const [initialJSON, setInitialJSON] = useState<{ [key: string]: string }>(
    sdk.field.getValue()
  );

  sdk.field.onValueChanged((value) => {
    if (JSON.stringify(value) !== JSON.stringify(initialJSON))
      setInitialJSON(value);
  });

  useEffect(() => {
    sdk.window.startAutoResizer();
  }, [initialJSON]);

  useEffect(() => {
    if (!!!Object.keys(initialJSON).length) {
      setInitialJSON(sdk.entry.fields[sdk.field.id].getValue("en-US"));
      sdk.field.setValue(sdk.entry.fields[sdk.field.id].getValue("en-US"));
    }
  }, []);

  const updateFieldValue = () => {
    sdk.field.setValue({ ...initialJSON, [newPair.key]: newPair.value });
    setNewPair({ key: "", value: "" });
  };

  const removePair = (key: string) => {
    sdk.locales.available.forEach((locale) => {
      const data = sdk.entry.fields[sdk.field.id].getValue(locale);
      const { [key]: toRemove, ...rest } = data;
      sdk.entry.fields[sdk.field.id].setValue(rest, locale);
      setInitialJSON(rest);
    });
  };

  return (
    <Flex flexDirection="column" gap="40px">
      <Flex flexDirection="column">
        <Flex gap="30px" style={{ height: "20px" }}>
          <SectionHeading style={{ flexGrow: "1" }}>
            {sdk.parameters.instance.key}
          </SectionHeading>
          <SectionHeading style={{ flexGrow: "1" }}>
            {sdk.parameters.instance.value}
          </SectionHeading>
        </Flex>
        {Object.entries(initialJSON).map(([key, value]) => (
          <Flex key={key} gap="30px">
            <TextInput isDisabled={true} value={key} placeholder="key" />
            <TextInput
              placeholder={value}
              value={value}
              onChange={(e) => {
                sdk.field.setValue({ ...initialJSON, [key]: e.target.value });
              }}
            />
            {sdk.field.locale === "en-US" && (
              <Button variant="negative" onClick={() => removePair(key)}>
                X
              </Button>
            )}
          </Flex>
        ))}
      </Flex>

      {sdk.field.locale === "en-US" ? (
        <Flex flexDirection="column">
          <SectionHeading style={{ height: "20px", marginBottom: 0 }}>
            NEW PAIR
          </SectionHeading>
          <Flex gap="30px">
            <TextInput
              onChange={(e) => setNewPair({ ...newPair, key: e.target.value })}
              value={newPair.key}
              placeholder={sdk.parameters.instance.key}
            />
            <TextInput
              onChange={(e) =>
                setNewPair({ ...newPair, value: e.target.value })
              }
              value={newPair.value}
              placeholder={sdk.parameters.instance.value}
            />
            <Button onClick={updateFieldValue} variant="positive">
              +
            </Button>
          </Flex>
        </Flex>
      ) : (
        "Change locale to en-US to add more elements"
      )}
    </Flex>
  );
};

export default Field;
