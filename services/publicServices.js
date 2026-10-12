const supabase = require("../config/supabaseClient");

async function deleteBucketItem(fileName) {
  const { data, error } = await supabase.storage
    .from("user-uploads")
    .remove([fileName]);

  if (error) {
    console.error("Delete error:", error.message);
  } else {
    console.log("File deleted successfully:", data);
  }
}

module.exports = {
  deleteBucketItem
};
