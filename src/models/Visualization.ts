import mongoose from "mongoose";
import * as autopopulate from "mongoose-autopopulate"

// TODO: This is untested. Remove me when this works

export type VisualizationModel = mongoose.Document & {
  visualizationType: string,
  usedBySongs: string[],
  data: { [k: string]: any }
};

const visualizationSchema = new mongoose.Schema({
  visualizationType: {
    type: String,
    enum: [ "VisualizationStandard" ]
  },
  usedBySongs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Song'
  }],
  data: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'visualizationType',
    autopopulate: true,
    required: true
  }
}, { timestamps: true, strict: true });
visualizationSchema.plugin(autopopulate);

const Visualization = mongoose.model("Visualization", visualizationSchema);
export default Visualization;
