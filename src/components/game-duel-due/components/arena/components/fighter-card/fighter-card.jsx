export const FighterCard = ({ fighter }) => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md min-w-[160px]">
      <h2 className="font-bold text-lg">{fighter.name}</h2>
      <p>❤️ {fighter.hp}</p>
      <p>🗡️ ATK: {fighter.getTotalStat("atk")}</p>
      <p>🛡️ HP: {fighter.getTotalStat("hp")}</p>
      <p className="mt-2 font-semibold">Abilities:</p>
      <ul className="list-disc list-inside">
        {fighter.abilities.map((a, i) => (
          <li key={i}>{a.name}</li>
        ))}
      </ul>
    </div>
  );
};
