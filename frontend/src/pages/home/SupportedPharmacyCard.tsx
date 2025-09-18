type Props = {
  name: string;
  imageUrl: string;
  websiteUrl: string;
};

export default function PharmacyCard({ name, imageUrl, websiteUrl }: Props) {
  return (
    <div className="border-dark/50 w-[15%] rounded-4xl border-2 bg-white px-5 py-8">
      <img
        src={imageUrl}
        alt={name}
      ></img>
      <p className="mt-5">
        <a
          href={websiteUrl}
          target="_blank"
          className="hover:decoration-accent hover:underline"
        >
          {name}
        </a>
      </p>
    </div>
  );
}
