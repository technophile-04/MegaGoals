import CommitmentDetails from "../_component/CommitmentDetails";

const Commitment = async ({ params }: { params: { commitmentId: string } }) => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Commitment Details</h1>
      <CommitmentDetails id={params.commitmentId} />
    </div>
  );
};

export default Commitment;
