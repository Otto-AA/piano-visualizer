import mongoose from "mongoose";
import { isNumber } from "util";

function NoCastString(key: any, options: any) {
  mongoose.SchemaType.call(this, key, options, "NoCastString");
}
NoCastString.prototype = Object.create(mongoose.SchemaType.prototype);

NoCastString.prototype.cast = function(str: any) {
  if (typeof str !== "string") {
    throw new Error(`NoCastString: ${str} is not a string`);
  }
  return str;
};

// TODO: Check if this is possible to do correctly
// @ts-ignore
mongoose.Schema.Types.NoCastString = NoCastString;

export type VisualizationStandardModel = VisualizationStandardData & mongoose.Document;

export type VisualizationStandardData = {
  background: {
    image: {
      link: string,
      creator: string,
      creatorLink: string
    },
    gradient: string[]
  },
  audioVisualization: {
    bar: {
      gradient: string[],
      width: number
    }
  },
  pianoVisualization: {
    key: {
      border: {
        white: boolean,
        black: boolean,
        color: string
      },
      pressedColor: string
    }
  },
  fontColor: string
};

// TODO: Update this function
const isColorString = (str: string) => {
  if (typeof str !== "string") {
    throw new Error("type of color must be a string");
  }

  // From https://stackoverflow.com/a/8027444/6548154
  return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(str);
};

const threeColorGradient = {
  type: [String],
  validate: (gradient: string[]) => gradient.length === 3 && gradient.every(isColorString)
};

const visualizationStandardSchema = new mongoose.Schema({
  background: {
    image: {
      link: { type: NoCastString, required: true },
      creator: { type: NoCastString, required: true },
      creatorLink: { type: NoCastString, required: true },
    },
    gradient: { ...threeColorGradient, required: true }
  },
  audioVisualization: {
    bar: {
      gradient: { ...threeColorGradient, required: true },
      width: {
        type: Number,
        min: 1,
        required: true
      }
    }
  },
  pianoVisualization: {
    key: {
      border: {
        white: { type: Boolean, required: true },
        black: { type: Boolean, required: true },
        color: { type: NoCastString, required: true }
      },
      pressedColor: { type: NoCastString, required: true }
    }
  },
  fontColor: { type: NoCastString, required: true }
}, { timestamps: true, strict: true });

const VisualizationStandard = mongoose.model("VisualizationStandard", visualizationStandardSchema);
export default VisualizationStandard;
