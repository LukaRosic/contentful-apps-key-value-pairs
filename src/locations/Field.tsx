import React, { useEffect, useState } from "react";
import {
  Button,
  Flex,
  FormControl,
  TextInput,
} from "@contentful/f36-components";
import {
  EntryAPI,
  FieldAPI,
  FieldAppSDK,
  WindowAPI,
} from "@contentful/app-sdk";
import { useSDK } from "@contentful/react-apps-toolkit";

const MAIN_LOCALE = "en-US";
type PairType = {
  [key: string]: string;
};

const Field = () => {
  const sdk = useSDK<FieldAppSDK>();

  const window: WindowAPI | null = sdk.window ?? null;
  const field: FieldAPI | null = sdk.field ?? null;
  const entry: EntryAPI | null = sdk.entry ?? null;
  const isMainLocale = field.locale === MAIN_LOCALE;
  const [pairs, setPairs] = useState<PairType>({});

  useEffect(() => {
    resize();
  });

  const resize = () => {
    window?.startAutoResizer();

    // Every time we change the value on the field, we update internal state
    field?.onValueChanged((value: PairType) => {
      setPairs(value);
    });
  };

  const handleDelete = (key: string) => {
    sdk.locales.available.forEach((locale) => {
      const localeField = entry.fields[field.id].getValue(locale);
      const { [key]: keyToDelete, ...rest } = localeField;
      entry.fields[field.id].setValue(rest, locale);
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    key: string
  ) => {
    const oldField = field.getValue();
    field.setValue({ ...oldField, [key]: e.target.value });
  };
  return (
    <Flex flexDirection="column" gap="40px">
      {/* DEBUG BUTTONS */}
      {/* <Flex gap="20px">
        <Button onClick={() => console.log(field.getValue())}>
          log field.getValue()
        </Button>
        <Button
          onClick={() => {
            sdk.locales.available.forEach((locale) => {
              entry.fields[field.id].setValue(undefined, locale);
            });
          }}
          variant="negative"
        >
          clear all fields
        </Button>
        <Button onClick={() => console.log("state: ", pairs)}>LOG STATE</Button>
        <Button
          onClick={() => {
            sdk.locales.available.forEach((locale) => {
              console.log("");
              console.log("locale: ", locale);
              console.log(
                "getvalue: ",
                entry.fields[field.id].getValue(locale)
              );
            });
          }}
          variant="negative"
        >
          log fields in all locales
        </Button>
      </Flex> */}
      <Flex flexDirection="column" gap="8px">
        {pairs &&
          Object.entries(pairs).map(([key, value], index) => {
            return (
              <Flex gap="16px">
                <TextInput isDisabled={true} value={key} placeholder="key" />
                <TextInput
                  value={value}
                  placeholder="value"
                  onChange={(e) => handleChange(e, key)}
                />
                {isMainLocale && (
                  <Button variant="negative" onClick={() => handleDelete(key)}>
                    x
                  </Button>
                )}
              </Flex>
            );
          })}
      </Flex>
      {isMainLocale && <NewField sdk={sdk} field={field} entry={entry} />}
    </Flex>
  );
};

export default Field;

type NewFieldProps = {
  field: FieldAPI;
  entry: EntryAPI;
  sdk: FieldAppSDK;
};
const NewField = ({ field, entry, sdk }: NewFieldProps) => {
  const [newField, setNewField] = useState({ key: "", value: "" });
  return (
    <FormControl>
      <FormControl.Label>Add new Pair</FormControl.Label>
      <Flex gap="16px">
        <TextInput
          placeholder="key"
          value={newField.key}
          onChange={(e) => setNewField({ ...newField, key: e.target.value })}
        ></TextInput>
        <TextInput
          placeholder="value"
          value={newField.value}
          onChange={(e) => setNewField({ ...newField, value: e.target.value })}
        ></TextInput>
        <Button
          variant="positive"
          isDisabled={!!!newField.key || !!!newField.value}
          onClick={() => {
            const newPair = { [newField.key]: newField.value };

            sdk.locales.available.forEach((locale) => {
              const oldField = entry.fields[field.id].getValue(locale);
              entry.fields[field.id].setValue(
                { ...oldField, ...newPair },
                locale
              );
            });
            setNewField({ key: "", value: "" });
          }}
        >
          +
        </Button>
      </Flex>
    </FormControl>
  );
};
