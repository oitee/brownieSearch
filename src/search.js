export async function insertDoc(request, response) {
  //this is a post route
  // order of inserting documents:
  /**
    {document:
        [{
            id: 123,
            doc: "abc"
        }, 
        {
            id: 123,
            doc: "abc"
        }]

    } 

     */
  const resBody = await request.body;
  if (
    typeof resBody !== "object" ||
    Object.keys(resBody).length === 0 ||
    !resBody.document ||
    !Array.isArray(resBody.document)
  ) {
    console.log(resBody);
    return response.status(400).json({ error: "Response Body invalid" });
  }
  const store = request.store;
  let insertedDocCount = 0;
  for (let document of resBody.document) {
    if (document.id && document.doc) {
      await store.insert(document.id, document.doc);
      insertedDocCount++;
    }
  }

  if (insertedDocCount > 0) {
    return response.json({
      message: `Successfully inserted ${insertedDocCount} documents`,
    });
  }
  return response.json({ message: `No documents found.` });
}

export function searchDoc(request, response) {
  return response.send("Search route");
}

export function fetchDoc(request, response) {
  return response.send("fetch route");
}
