import {
  NullASTNodeImpl,
  PropertyASTNodeImpl,
  StringASTNodeImpl,
  ObjectASTNodeImpl,
  NumberASTNodeImpl,
  ArrayASTNodeImpl,
  BooleanASTNodeImpl,
  ASTNode,
} from "../../parser/ASTTypes";
import * as Yaml from "yaml-language-server-parser";

const maxRefCount = 1000;
let refDepth = 0;

//This is a patch for redirecting values with these strings to be boolean nodes because its not supported in the parser.
const possibleBooleanValues = [
  "y",
  "Y",
  "yes",
  "Yes",
  "YES",
  "n",
  "N",
  "no",
  "No",
  "NO",
  "on",
  "On",
  "ON",
  "off",
  "Off",
  "OFF",
];

export default function recursivelyBuildAst(node: Yaml.YAMLNode, parent?: ASTNode): ASTNode | undefined {
  if (!node) {
    return;
  }
  if (!parent) {
    // first invocation
    refDepth = 0;
  }

  if (refDepth > maxRefCount && node.kind === Yaml.Kind.ANCHOR_REF) {
    return;
  }

  switch (node.kind) {
    case Yaml.Kind.MAP: {
      const instance = <Yaml.YamlMap>node;

      const result = new ObjectASTNodeImpl(parent, node.startPosition, node.endPosition - node.startPosition);

      for (const mapping of instance.mappings) {
        result.properties.push(<PropertyASTNodeImpl>recursivelyBuildAst(mapping, result));
      }

      return result;
    }
    case Yaml.Kind.MAPPING: {
      const instance = <Yaml.YAMLMapping>node;
      const key = instance.key;

      const result = new PropertyASTNodeImpl(
        parent as ObjectASTNodeImpl,
        instance.startPosition,
        instance.endPosition - instance.startPosition
      );

      // Technically, this is an arbitrary node in YAML
      // I doubt we would get a better string representation by parsing it
      const keyNode = new StringASTNodeImpl(result, key.startPosition, key.endPosition - key.startPosition);
      keyNode.value = key.value;

      const valueNode = instance.value
        ? recursivelyBuildAst(instance.value, result) ?? new NullASTNodeImpl(parent, instance.endPosition, 0)
        : new NullASTNodeImpl(parent, instance.endPosition, 0);
      valueNode.location = key.value;

      result.keyNode = keyNode;
      result.valueNode = valueNode;

      return result;
    }
    case Yaml.Kind.SEQ: {
      const instance = <Yaml.YAMLSequence>node;

      const result = new ArrayASTNodeImpl(
        parent,
        instance.startPosition,
        instance.endPosition - instance.startPosition
      );

      instance.items.forEach((item, index) => {
        let itemNode;

        if (item === null) {
          const start = index === 0 ? instance.startPosition + 1 : instance.items[index - 1].endPosition + 1;
          const length =
            (index === instance.items.length - 1
              ? instance.endPosition - 1
              : instance.items[index + 1].startPosition - 1) - start;
          itemNode = new NullASTNodeImpl(result, start, length);
        } else {
          itemNode = recursivelyBuildAst(item, result);
        }

        if (itemNode) {
          result.children.push(itemNode);
        }
      });

      /*
      PERE: orignial code
      const count = 0;
      for (const item of instance.items) {
        if (item === null && count === instance.items.length - 1) {
          break;
        }

        // Be aware of https://github.com/nodeca/js-yaml/issues/321
        // Cannot simply work around it here because we need to know if we are in Flow or Block
        const itemNode = item === null ? new NullASTNodeImpl(parent, instance.endPosition, 0) : recursivelyBuildAst(item, result);

        if(itemNode) {
          result.children.push(itemNode);
        }
      }
      */
      return result;
    }
    case Yaml.Kind.SCALAR: {
      const instance = <Yaml.YAMLScalar>node;
      const type = Yaml.determineScalarType(instance);

      const value = instance.value;
      if (instance.plainScalar && possibleBooleanValues.indexOf(value.toString()) !== -1) {
        return new BooleanASTNodeImpl(
          parent,
          Yaml.parseYamlBoolean(value),
          node.startPosition,
          node.endPosition - node.startPosition
        );
      }

      switch (type) {
        case Yaml.ScalarType.null: {
          return new NullASTNodeImpl(parent, node.startPosition, node.endPosition - node.startPosition);
        }
        case Yaml.ScalarType.bool: {
          return new BooleanASTNodeImpl(
            parent,
            Yaml.parseYamlBoolean(value),
            node.startPosition,
            node.endPosition - node.startPosition
          );
        }
        case Yaml.ScalarType.int: {
          const result = new NumberASTNodeImpl(parent, node.startPosition, node.endPosition - node.startPosition);
          result.value = Yaml.parseYamlInteger(value);
          result.isInteger = true;
          return result;
        }
        case Yaml.ScalarType.float: {
          const result = new NumberASTNodeImpl(parent, node.startPosition, node.endPosition - node.startPosition);
          result.value = Yaml.parseYamlFloat(value);
          result.isInteger = false;
          return result;
        }
        case Yaml.ScalarType.string: {
          const result = new StringASTNodeImpl(parent, node.startPosition, node.endPosition - node.startPosition);
          result.value = node.value;
          return result;
        }
      }
      break;
    }
    case Yaml.Kind.ANCHOR_REF: {
      const instance = (<Yaml.YAMLAnchorReference>node).value;
      refDepth++;
      return (
        recursivelyBuildAst(instance, parent) ||
        new NullASTNodeImpl(parent, node.startPosition, node.endPosition - node.startPosition)
      );
    }
    case Yaml.Kind.INCLUDE_REF: {
      const result = new StringASTNodeImpl(parent, node.startPosition, node.endPosition - node.startPosition);
      result.value = node.value;
      return result;
    }
  }
}
