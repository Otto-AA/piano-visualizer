import mongoose from "mongoose";
import autopopulate from "mongoose-autopopulate";

// TODO: This is untested. Remove me when this works

export type VisualizationData = {
  visualizationType: string,
  usedBySongs: string[],
  data: { [k: string]: any }
};

export type VisualizationDoc = VisualizationData & mongoose.Document;

const visualizationSchema = new mongoose.Schema({
  visualizationType: {
    type: String,
    enum: [ "VisualizationStandard" ]
  },
  usedBySongs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Song"
  }],
  data: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "visualizationType",
    autopopulate: true,
    required: true
  }
}, { timestamps: true, strict: true });
visualizationSchema.plugin(autopopulate);

const Visualization = mongoose.model("Visualization", visualizationSchema);
export default Visualization;
